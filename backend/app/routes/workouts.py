from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.routes.auth import get_current_user, db_dependency
from backend.app.services.workout_service import generate_and_store_plan
from backend.app.schemas import WorkoutRead
from backend.app.models import Workout
from backend.app.database import get_db

router = APIRouter(prefix="/workouts", tags=["workouts"])


@router.get("/", response_model=list[WorkoutRead])
def get_workouts(db: db_dependency, current_user = Depends(get_current_user)):
    workouts = db.query(Workout).filter(Workout.user_id == current_user.id).all()
    if not workouts:
        raise HTTPException(status_code=404, detail="No workouts found")
    return workouts


@router.get("/{id}", response_model=WorkoutRead)
def get_workout_by_id(id: int, db: db_dependency, current_user = Depends(get_current_user)):
    workout = db.query(Workout).filter(Workout.id == id).first()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    if workout.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Workout does not belong to current user")
    return workout


@router.post("/generate")
async def generate_workouts(db: db_dependency, current_user = Depends(get_current_user)):
    try:
        plan = generate_and_store_plan(db, current_user)
        return {"message": "Workout plan created", "plan": plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))