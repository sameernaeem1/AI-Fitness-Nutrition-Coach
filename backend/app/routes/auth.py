from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from backend.app.database import get_db
from backend.app.models import User, UserProfile, Equipment, Injuries
from backend.app.schemas import UserCreate, OnboardingCreate, UserProfileRead, EquipmentRead, InjuryRead

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_hash = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("/equipment", response_model=list[EquipmentRead])
def list_equipment(db: Session = Depends(get_db)):
    return db.query(Equipment).all()


@router.get("/injuries", response_model=list[InjuryRead])
def list_equipment(db: Session = Depends(get_db)):
    return db.query(Injuries).all()


@router.post("/sign-up", response_model=UserProfileRead)
def signup(payload: OnboardingCreate, db: Session = Depends(get_db)):

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_hash.hash(payload.password)
    user = User(email=payload.email, password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)

    prof = payload.profile
    profile = UserProfile(
        user_id=user.id,
        first_name=prof.first_name,
        last_name=prof.last_name,
        birth_date=prof.birth_date,
        gender=prof.gender,
        height_cm=prof.height_cm,
        weight_kg=prof.weight_kg,
        experience_level=prof.experience_level,
        goal=prof.goal,
        frequency=prof.frequency,
    )

    if prof.equipment_ids:
        profile.equipment = db.query(Equipment).filter(Equipment.id.in_(prof.equipment_ids)).all()
    if prof.injury_ids:
        profile.injuries = db.query(Injuries).filter(Injuries.id.in_(prof.injury_ids)).all()
    
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.post("/sign-in", response_model=UserProfileRead)
def signin(payload: UserCreate, db: Session = Depends(get_db)):
    pass


@router.post("/equipment", response_model=UserProfileRead)
def add_equipment(payload: EquipmentRead, db: Session = Depends(get_db)):
    pass


@router.post("/injuries", response_model=UserProfileRead)
def add_injuries(payload: InjuryRead, db: Session = Depends(get_db)):
    pass