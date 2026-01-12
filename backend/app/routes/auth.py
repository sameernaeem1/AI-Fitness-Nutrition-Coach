from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
from pathlib import Path
from typing import Annotated

from backend.app.database import get_db
from backend.app.models import User, UserProfile, Equipment, Injury
from backend.app.schemas import OnboardingCreate, UserProfileRead, EquipmentRead, InjuryRead, Token, UpdateEquipment, UpdateInjuries, UserProfileUpdate


BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"
load_dotenv(env_path)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/sign-in")

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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    email: str = payload.get('sub')
    user_id: int = payload.get('id')
    if not email or not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

def create_access_token(username: str, user_id: int, expires_delta: timedelta | None = None):
    encode = {'sub': username, 'id': user_id}
    if expires_delta:
        expires = datetime.now(timezone.utc) + expires_delta
    else:
        expires = datetime.now(timezone.utc) + timedelta(minutes=20)
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_bodyweight_id(db: Session):
    item = db.query(Equipment).filter(Equipment.name.ilike("bodyweight")).first()
    if not item:
        raise HTTPException(status_code=500, detail="Bodyweight missing from equipment table")
    return item


@router.get("/equipment", response_model=list[EquipmentRead])
def list_equipment(db: db_dependency):
    return db.query(Equipment).all()


@router.get("/injuries", response_model=list[InjuryRead])
def list_injuries(db: db_dependency):
    return db.query(Injury).all()


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

    bodyweight_id = get_bodyweight_id(db)
    selected = []
    if prof.equipment_ids:
        selected = db.query(Equipment).filter(Equipment.id.in_(prof.equipment_ids)).all()
    if bodyweight_id not in selected:
        selected.append(bodyweight_id)
    profile.equipment = selected

    if prof.injury_ids:
        profile.injuries = db.query(Injury).filter(Injury.id.in_(prof.injury_ids)).all()
    
    db.add(profile)
    db.commit()
    db.refresh(profile)

    token = create_access_token(user.email, user.id, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": token, "token_type": "bearer"}


@router.post("/sign-in", response_model=Token)
def signin(form_data: form_dependency, db: db_dependency):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    token = create_access_token(user.email, user.id, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": token, "token_type": "bearer"}


@router.put("/me/equipment", response_model=UserProfileRead)
def update_equipment(payload: UpdateEquipment, current_user: User = Depends(get_current_user), db: db_dependency = Depends()):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    new_equipment = db.query(Equipment).filter(Equipment.id.in_(payload.equipment_ids)).all()
    bodyweight_id = get_bodyweight_id(db)
    if bodyweight_id not in new_equipment:
        new_equipment.append(bodyweight_id)
    profile.equipment = new_equipment
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/me/injuries", response_model=UserProfileRead)
def update_injuries(payload: UpdateInjuries, current_user: User = Depends(get_current_user), db: db_dependency = Depends()):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    new_injuries = db.query(Injury).filter(Injury.id.in_(payload.injury_ids)).all()
    profile.injuries = new_injuries
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/me/profile", response_model=UserProfileRead)
def update_profile(payload: UserProfileUpdate, current_user: User = Depends(get_current_user), db: db_dependency = Depends()):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profile.first_name = payload.first_name
    profile.last_name = payload.last_name
    profile.birth_date = payload.birth_date
    profile.gender = payload.gender
    profile.height_cm = payload.height_cm
    profile.weight_kg = payload.weight_kg
    profile.experience_level = payload.experience_level
    profile.goal = payload.goal
    profile.frequency = payload.frequency
    
    db.commit()
    db.refresh(profile)
    return profile


