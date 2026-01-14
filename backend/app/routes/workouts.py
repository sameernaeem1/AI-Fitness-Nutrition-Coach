from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.database import get_db

router = APIRouter(prefix="/workouts", tags=["workouts"])


@router.get("/")
def get_workouts():
    pass


@router.get("/{id}")
def get_workout_by_id():
    pass


@router.post("/generate")
async def generate_workouts():
    pass