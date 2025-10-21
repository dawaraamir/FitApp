from __future__ import annotations

from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class ExerciseBase(BaseModel):
    exerciseName: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    sets: int = Field(..., ge=0)
    reps: int = Field(..., ge=0)
    image: Optional[str] = Field(default="")


class Exercise(ExerciseBase):
    id: int


class ExerciseUpdate(BaseModel):
    exerciseName: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    sets: Optional[int] = Field(default=None, ge=0)
    reps: Optional[int] = Field(default=None, ge=0)
    image: Optional[str] = None


class UserBase(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=1)
    exercise: Optional[Exercise] = None


class User(UserBase):
    userId: int


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    exercise: Optional[Exercise] = None


app = FastAPI(title="FitApp API", openapi_url="/fit/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


_exercises: Dict[int, Exercise] = {}
_users: Dict[int, User] = {}
_exercise_id_seq = 0
_user_id_seq = 0


def _next_exercise_id() -> int:
    global _exercise_id_seq
    _exercise_id_seq += 1
    return _exercise_id_seq


def _next_user_id() -> int:
    global _user_id_seq
    _user_id_seq += 1
    return _user_id_seq


def _seed_data() -> None:
    if _exercises:
        return

    sample_exercises = [
        {
            "exerciseName": "Push Ups",
            "category": "Chest",
            "description": "Bodyweight push exercise to strengthen the chest and triceps.",
            "sets": 3,
            "reps": 12,
            "image": "",
        },
        {
            "exerciseName": "Squats",
            "category": "Legs",
            "description": "Compound lower body movement targeting quads and glutes.",
            "sets": 4,
            "reps": 10,
            "image": "",
        },
    ]

    for payload in sample_exercises:
        exercise = Exercise(id=_next_exercise_id(), **payload)
        _exercises[exercise.id] = exercise

    sample_users = [
        {
            "name": "Avery Patel",
            "email": "avery@example.com",
            "password": "demo",
            "exercise": _exercises[1],
        }
    ]

    for payload in sample_users:
        user = User(userId=_next_user_id(), **payload)
        _users[user.userId] = user


_seed_data()


@app.get("/fit/exercise", response_model=List[Exercise])
def list_exercises() -> List[Exercise]:
    return list(_exercises.values())


@app.post("/fit/exercise", response_model=Exercise, status_code=201)
def create_exercise(exercise: ExerciseBase) -> Exercise:
    exercise_id = _next_exercise_id()
    record = Exercise(id=exercise_id, **exercise.dict())
    _exercises[exercise_id] = record
    return record


@app.get("/fit/exercise/{exercise_id}", response_model=Exercise)
def get_exercise(exercise_id: int) -> Exercise:
    record = _exercises.get(exercise_id)
    if not record:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return record


@app.put("/fit/exercise/{exercise_id}", response_model=Exercise)
def update_exercise(exercise_id: int, payload: ExerciseUpdate) -> Exercise:
    stored = _exercises.get(exercise_id)
    if not stored:
        raise HTTPException(status_code=404, detail="Exercise not found")

    updated_values = stored.dict()
    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            updated_values[field] = value

    updated = Exercise(**updated_values)
    _exercises[exercise_id] = updated
    return updated


@app.delete("/fit/exercise/{exercise_id}")
def delete_exercise(exercise_id: int) -> Dict[str, str]:
    if exercise_id not in _exercises:
        raise HTTPException(status_code=404, detail="Exercise not found")
    del _exercises[exercise_id]
    return {"status": "deleted"}


@app.get("/fit/user", response_model=List[User])
def list_users() -> List[User]:
    return list(_users.values())


@app.post("/fit/user", response_model=User, status_code=201)
def create_user(user: UserBase) -> User:
    user_id = _next_user_id()
    record = User(userId=user_id, **user.dict())
    _users[user_id] = record
    return record


@app.get("/fit/user/{user_id}", response_model=User)
def get_user(user_id: int) -> User:
    record = _users.get(user_id)
    if not record:
        raise HTTPException(status_code=404, detail="User not found")
    return record


@app.put("/fit/user/{user_id}", response_model=User)
def update_user(user_id: int, payload: UserUpdate) -> User:
    stored = _users.get(user_id)
    if not stored:
        raise HTTPException(status_code=404, detail="User not found")

    updated_values = stored.dict()
    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            updated_values[field] = value

    updated = User(**updated_values)
    _users[user_id] = updated
    return updated


@app.delete("/fit/user/{user_id}")
def delete_user(user_id: int) -> Dict[str, str]:
    if user_id not in _users:
        raise HTTPException(status_code=404, detail="User not found")
    del _users[user_id]
    return {"status": "deleted"}
