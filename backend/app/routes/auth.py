from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from pathlib import Path
from typing import Annotated

from backend.app.database import get_db
from backend.app.models import User, UserProfile, Equipment, Injuries
from backend.app.schemas import UserCreate, OnboardingCreate, UserProfileRead, EquipmentRead, InjuryRead, Token


BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"
load_dotenv(env_path)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

pwd_hash = CryptContext(schemes=["bcrypt"], deprecated="auto")

db_dependency = Annotated[Session, Depends(get_db)]
form_dependency = Annotated[OAuth2PasswordRequestForm, Depends()]
token_dependency = Annotated[str, Depends(oauth2_scheme)]


def authenticate_user(db: Session, email:str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not pwd_hash.verify(password, user.password):
        return None
    return user

def get_current_user(token: token_dependency, db: db_dependency):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    email: str = payload.get('sub')
    user_id: int = payload.get('id')
    if not email or not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

def create_access_token(username: str, user_id: int, expires_delta: timedelta):
    encode = {'sub': username, 'id': user_id}
    expires = datetime.utcnow() + expires_delta
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


@router.get("/equipment", response_model=list[EquipmentRead])
def list_equipment(db: db_dependency):
    return db.query(Equipment).all()


@router.get("/injuries", response_model=list[InjuryRead])
def list_equipment(db: db_dependency):
    return db.query(Injuries).all()


@router.get("/me", response_model=UserProfileRead)
def my_profile(current_user: User = Depends(get_current_user), db: db_dependency = Depends()):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/sign-up", response_model=Token)
def signup(payload: OnboardingCreate, db: db_dependency):

    if db.query(User).filter(User.email == payload.user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_hash.hash(payload.user.password)
    user = User(email=payload.user.email, password=hashed_password)
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

    token = create_access_token(user.email, user.id, timedelta(minutes=20))
    return {"access_token": token, "token_type": "bearer"}


@router.post("/sign-in", response_model=Token)
def signin(form_data: form_dependency, db: db_dependency):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    token = create_access_token(user.email, user.id, timedelta(minutes=20))
    return {"access_token": token, "token_type": "bearer"}


# @router.post("/me/equipment", response_model=UserProfileRead)
# def add_equipment(payload: EquipmentRead, db: Session = Depends(get_db)):
#     pass


# @router.post("/me/injuries", response_model=UserProfileRead)
# def add_injuries(payload: InjuryRead, db: Session = Depends(get_db)):
#     pass

