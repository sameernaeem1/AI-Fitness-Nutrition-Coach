import json
from sqlalchemy.orm import Session
from backend.app.services.plan_generator import generate_workout_plan, build_prompt
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
    prompt = build_prompt(profile, exercises)
    ai_response = generate_workout_plan(prompt)
    plan = json.loads(ai_response)

    today = date.today()
    for week in plan["weeks"]:
        for day in week["days"]:
            date_offset = day.get("date_offset", 0)
            workout_date = today + timedelta(days=date_offset)
            db.add(Workout(user_id=user.id, date=workout_date, exercise_list=day))
    
    db.commit()
    return plan
