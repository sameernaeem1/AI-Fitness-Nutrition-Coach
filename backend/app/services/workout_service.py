import json
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from fastapi import HTTPException, status
from backend.app.services.plan_generator import call_ai, build_workout_plan_prompt, build_swap_exercise_prompt
from backend.app.models import Exercise, UserProfile, Workout
from datetime import date, timedelta

def get_user_data(db: Session, user_id: int):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise Exception("Profile not found")
    
    exercises = db.query(Exercise).all()
    return profile, exercises


def generate_and_store_plan(db: Session, user):
    profile, exercises = get_user_data(db, user.id)
    prompt = build_workout_plan_prompt(profile, exercises)

    try:
        ai_response = call_ai(prompt)
        plan = json.loads(ai_response)
        today = date.today()

        # Delete next 4 weeks to avoid duplicate entries if user regenerates plan
        next_month = today + timedelta(days=28)
        db.query(Workout).filter(Workout.user_id == user.id, Workout.date >= today, Workout.date <= next_month).delete(synchronize_session=False)

        for week in plan["weeks"]:
            for day in week["days"]:
                date_offset = day.get("date_offset", 0)
                workout_date = today + timedelta(days=date_offset)
                db.add(Workout(user_id=user.id, date=workout_date, exercise_list=day))
    
        db.commit()
        return plan
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to generate workout plan")
    

def smart_swap(payload, db: Session, current_user):
    workout = db.query(Workout).filter(Workout.id == payload.workout_id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    if workout.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this workout")

    current_data = dict(workout.exercise_list) if workout.exercise_list else {}
    exercise_list = current_data.get("exercises", [])

    if not exercise_list or payload.exercise_index < 0 or payload.exercise_index >= len(exercise_list):
        raise HTTPException(status_code=400, detail="Invalid exercise index")

    current_exercise = exercise_list[payload.exercise_index]
    profile, all_exercises = get_user_data(db, current_user.id)

    try:
        prompt = build_swap_exercise_prompt(profile, all_exercises, current_exercise)
        ai_raw_response = call_ai(prompt)
        
        if isinstance(ai_raw_response, str):
            new_exercise = json.loads(ai_raw_response)
        else:
            new_exercise = ai_raw_response

        exercise_list[payload.exercise_index] = new_exercise
        
        current_data["exercises"] = exercise_list
        workout.exercise_list = current_data

        flag_modified(workout, "exercise_list")
        db.commit()
        db.refresh(workout)
        
        return workout

    except json.JSONDecodeError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="AI returned an unreadable exercise format.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to swap exercise: {str(e)}")