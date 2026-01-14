from __future__ import annotations
from pydantic import BaseModel, EmailStr, Field, field_validator, computed_field
from enum import Enum
from datetime import date


class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class Goal(str, Enum):
    cut = "cut"
    bulk = "bulk"
    maintain = "maintain"

class ExperienceLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

class LogType(str, Enum):
    meal = "meal"
    workout = "workout"


class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: int

    class Config:
        from_attributes = True


class UserProfileBase(BaseModel):
    first_name: str
    last_name: str
    birth_date: date
    gender: Gender
    height_cm: float = Field(..., ge=50, le=250)
    weight_kg: float = Field(..., ge=20, le=500)
    experience_level: ExperienceLevel
    goal: Goal
    frequency: int = Field(..., ge=1, le=7)

    @field_validator("birth_date")
    @classmethod
    def validate_age(cls, dob: date):
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        if age < 13:
            raise ValueError("User must be at least 13 years old.")
        if age > 100:
            raise ValueError("User must be no older than 100 years old.")
        return dob

class UserProfileCreate(UserProfileBase):
    injury_ids: list[int] = Field(default_factory=list)
    equipment_ids: list[int] = Field(default_factory=list)

class UserProfileRead(UserProfileBase):
    id: int
    user_id: int
    equipment: list[EquipmentRead] = []
    injuries: list[InjuryRead] = []

    # @computed_field(return_type=list[int])
    # def equipment_ids(self) -> list[int]:
    #     items = getattr(self, "equipment", None) or []
    #     return [int(getattr(e, "id")) for e in items]
    
    # @computed_field(return_type=list[int])
    # def injury_ids(self) -> list[int]:
    #     items = getattr(self, "injuries", None) or []
    #     return [int(getattr(i, "id")) for i in items]

    class Config:
        from_attributes=True

class UserProfileUpdate(UserProfileBase):
    pass


class OnboardingCreate(BaseModel):
    user: UserCreate
    profile: UserProfileCreate


class Token(BaseModel):
    access_token: str
    token_type: str


class EquipmentBase(BaseModel):
    name: str

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentRead(EquipmentBase):
    id: int

    class Config:
        from_attributes=True

class UpdateEquipment(BaseModel):
    equipment_ids: list[int]


class InjuryBase(BaseModel):
    name: str

class InjuryCreate(InjuryBase):
    pass

class InjuryRead(InjuryBase):
    id: int

    class Config:
        from_attributes=True

class UpdateInjuries(BaseModel):
    injury_ids: list[int]


class ExerciseBase(BaseModel):
    name: str
    target_muscle: str
    difficulty_tier: int = Field(..., ge=1, le=5)
    equipment_id: int | None = None

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseRead(ExerciseBase):
    id: int

    class Config:
        from_attributes=True


class WorkoutBase(BaseModel):
    date: date
    exercise_list: dict

class WorkoutCreate(WorkoutBase):
    pass

class WorkoutRead(WorkoutBase):
    id: int
    user_id: int

    class Config:
        from_attributes=True

# Will come back to the log stuff later to add calories macros portion ingredients health score
class LogBase(BaseModel):
    type: LogType
    image_url: str
    ai_analysis_json: dict

class LogCreate(LogBase):
    pass

class LogRead(LogBase):
    id: int
    user_id: int

    class Config:
        from_attributes=True


