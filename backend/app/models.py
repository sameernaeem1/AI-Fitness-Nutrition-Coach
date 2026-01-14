from backend.app.database import Base
from backend.app.schemas import Gender, Goal, ExperienceLevel, LogType
from sqlalchemy import Column, Integer, String, Float, Date, Enum, ForeignKey, Table, JSON, TIMESTAMP
from sqlalchemy.orm import relationship

user_injuries = Table(
    "user_injuries",
    Base.metadata,
    Column("user_profile_id", Integer, ForeignKey("user_profiles.id"), primary_key=True),
    Column("injury_id", Integer, ForeignKey("injuries.id"), primary_key=True)
)

user_equipment = Table(
    "user_equipment",
    Base.metadata,
    Column("user_profile_id", Integer, ForeignKey("user_profiles.id"), primary_key=True),
    Column("equipment_id", Integer, ForeignKey("equipment.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    workouts = relationship("Workout", back_populates="user")
    logs = relationship("Log", back_populates="user")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    birth_date = Column(Date, nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    height_cm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    experience_level = Column(Enum(ExperienceLevel), nullable=False)
    goal = Column(Enum(Goal), nullable=False)
    frequency = Column(Integer, nullable=False)

    user = relationship("User", back_populates="profile")
    injuries = relationship("Injury", secondary=user_injuries, back_populates="profiles")
    equipment = relationship("Equipment", secondary=user_equipment, back_populates="profiles")

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    profiles = relationship("UserProfile", secondary=user_equipment, back_populates="equipment")
    exercises = relationship("Exercise", back_populates="equipment")

class Injury(Base):
    __tablename__ = "injuries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    profiles = relationship("UserProfile", secondary=user_injuries, back_populates="injuries")

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    target_muscle = Column(String, nullable=False)
    difficulty_tier = Column(Integer, nullable=True) #Come back to this at later time
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=True)

    equipment = relationship("Equipment", back_populates="exercises")

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    exercise_list = Column(JSON, nullable=False)

    user = relationship("User", back_populates="workouts")

#Come back to this later
class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    type = Column(Enum(LogType), nullable=False)
    image_url = Column(String, nullable=False)
    ai_analysis_json = Column(JSON, nullable=False)

    user = relationship("User", back_populates="logs")