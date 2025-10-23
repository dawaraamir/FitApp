from __future__ import annotations

from enum import Enum
from hashlib import sha1
from typing import Dict, List, Optional, Sequence, Tuple

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .storage import load_storage, save_storage
from .provider_clients import ProviderFetchError, fetch_provider_payload


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


class NutritionGoal(str, Enum):
    fat_loss = "fat_loss"
    maintain = "maintain"
    muscle_gain = "muscle_gain"


class DietPreference(str, Enum):
    standard = "standard"
    vegetarian = "vegetarian"
    vegan = "vegan"
    pescatarian = "pescatarian"
    gluten_free = "gluten_free"


class MealIdea(BaseModel):
    name: str
    mealType: str
    calories: int
    protein: int
    carbs: int
    fat: int
    prepTime: int = Field(..., ge=1)
    description: str
    tags: List[str] = Field(default_factory=list)


class MealPlanDay(BaseModel):
    day: str
    focus: str
    totalCalories: int
    meals: List[MealIdea]
    coachTip: Optional[str] = None
    macros: Optional[Dict[str, int]] = None


class MacroTargets(BaseModel):
    protein: int
    carbs: int
    fat: int


class MealPlanSummary(BaseModel):
    targetCalories: int
    goal: NutritionGoal
    diet: DietPreference
    hydrationCups: int
    macroTargets: MacroTargets
    actualMacros: MacroTargets
    highlights: List[str]
    tips: List[str]


class MealPlanRequest(BaseModel):
    goal: NutritionGoal = NutritionGoal.maintain
    calories: Optional[int] = Field(default=None, ge=1200, le=4500)
    diet: DietPreference = DietPreference.standard
    days: int = Field(default=3, ge=1, le=5)
    restrictions: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    preferences: Optional[str] = None
    supplements: Optional[str] = None
    weightGoalShort: Optional[str] = None
    weightGoalLong: Optional[str] = None
    activityLevel: Optional[str] = None


class MealPlanResponse(BaseModel):
    summary: MealPlanSummary
    days: List[MealPlanDay]
    rotation: List[str] = Field(default_factory=list)


class ScheduleRequest(BaseModel):
    fullName: Optional[str] = None
    occupation: Optional[str] = None
    workStyle: Optional[str] = None
    timezone: Optional[str] = None
    goal: NutritionGoal = NutritionGoal.maintain
    preferredWindows: List[str] = Field(default_factory=list)
    equipmentAccess: List[str] = Field(default_factory=list)
    dietPreference: DietPreference = DietPreference.standard
    commuteMinutes: Optional[int] = Field(default=None, ge=0, le=240)
    stressLevel: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=10, le=100)
    gender: Optional[str] = None
    activityLevel: Optional[str] = None
    injuries: Optional[str] = None
    dietaryRestrictions: Optional[str] = None
    dietaryAllergies: Optional[str] = None
    dietaryPreferences: Optional[str] = None
    supplements: Optional[str] = None
    weightGoalShort: Optional[str] = None
    weightGoalLong: Optional[str] = None


class ScheduledSession(BaseModel):
    day: str
    window: str
    focus: str
    durationMinutes: int
    equipment: str
    intensity: str


class ScheduleNotes(BaseModel):
    summary: str
    recoveryTip: str
    mealAlignment: str


class ScheduleResponse(BaseModel):
    sessions: List[ScheduledSession]
    notes: ScheduleNotes
    insights: List[str] = Field(default_factory=list)


class WellnessMetric(BaseModel):
    timestamp: str
    source: Optional[str] = None
    steps: Optional[int] = Field(default=None, ge=0)
    sleepHours: Optional[float] = Field(default=None, ge=0)
    readiness: Optional[int] = Field(default=None, ge=0, le=100)
    energyLevel: Optional[str] = None
    comment: Optional[str] = None


class CoachAction(BaseModel):
    headline: str
    description: str


class CoachRecommendationRequest(BaseModel):
    schedule: ScheduleRequest
    mealPlan: Optional[MealPlanRequest] = None
    focusAreas: List[str] = Field(default_factory=list)


class CoachRecommendation(BaseModel):
    profileHash: str
    schedule: ScheduleResponse
    mealPlan: MealPlanResponse
    takeaways: List[str]
    nextActions: List[CoachAction]


MEAL_LIBRARY: List[Dict[str, object]] = [
    {
        "name": "Berry Protein Overnight Oats",
        "mealType": "Breakfast",
        "calories": 380,
        "protein": 28,
        "carbs": 46,
        "fat": 11,
        "prepTime": 5,
        "description": "Rolled oats soaked overnight with Greek yogurt, chia, berries, and almond butter.",
        "tags": ["fiber-rich", "prep ahead"],
        "diets": ["standard", "vegetarian"],
    },
    {
        "name": "Avocado Tofu Scramble Wrap",
        "mealType": "Breakfast",
        "calories": 340,
        "protein": 24,
        "carbs": 38,
        "fat": 12,
        "prepTime": 12,
        "description": "Tofu scramble with spinach, peppers, and avocado tucked into a whole-grain wrap.",
        "tags": ["plant-based", "high protein"],
        "diets": ["vegetarian", "vegan"],
    },
    {
        "name": "Smoked Salmon Power Toast",
        "mealType": "Breakfast",
        "calories": 360,
        "protein": 30,
        "carbs": 28,
        "fat": 15,
        "prepTime": 8,
        "description": "Smoked salmon, whipped cottage cheese, capers, and arugula over rye bread.",
        "tags": ["omega-3", "quick"],
        "diets": ["standard", "pescatarian"],
    },
    {
        "name": "Grilled Chicken Power Bowl",
        "mealType": "Lunch",
        "calories": 520,
        "protein": 46,
        "carbs": 48,
        "fat": 18,
        "prepTime": 20,
        "description": "Grilled chicken with roasted sweet potatoes, quinoa, kale, and citrus vinaigrette.",
        "tags": ["meal-prep friendly"],
        "diets": ["standard", "gluten_free"],
    },
    {
        "name": "Mediterranean Quinoa Crunch",
        "mealType": "Lunch",
        "calories": 480,
        "protein": 21,
        "carbs": 57,
        "fat": 18,
        "prepTime": 18,
        "description": "Quinoa tossed with chickpeas, cucumbers, roasted peppers, olives, and feta.",
        "tags": ["anti-inflammatory"],
        "diets": ["standard", "vegetarian"],
    },
    {
        "name": "Spiced Lentil & Veggie Bowl",
        "mealType": "Lunch",
        "calories": 450,
        "protein": 24,
        "carbs": 60,
        "fat": 12,
        "prepTime": 22,
        "description": "Warm lentils, roasted cauliflower, turmeric carrots, and tahini drizzle.",
        "tags": ["plant-based protein"],
        "diets": ["vegetarian", "vegan", "gluten_free"],
    },
    {
        "name": "Miso Glazed Salmon Bowl",
        "mealType": "Dinner",
        "calories": 610,
        "protein": 44,
        "carbs": 52,
        "fat": 24,
        "prepTime": 25,
        "description": "Broiled salmon with brown rice, sesame greens, and pickled cucumbers.",
        "tags": ["omega-3", "recovery"],
        "diets": ["standard", "pescatarian", "gluten_free"],
    },
    {
        "name": "Turkey & Sweet Potato Skillet",
        "mealType": "Dinner",
        "calories": 560,
        "protein": 42,
        "carbs": 49,
        "fat": 19,
        "prepTime": 28,
        "description": "Ground turkey sautéed with sweet potato, kale, and smoky spices.",
        "tags": ["family style"],
        "diets": ["standard", "gluten_free"],
    },
    {
        "name": "Coconut Red Lentil Curry",
        "mealType": "Dinner",
        "calories": 520,
        "protein": 26,
        "carbs": 62,
        "fat": 18,
        "prepTime": 30,
        "description": "Creamy coconut curry with red lentils, spinach, and basmati rice.",
        "tags": ["comfort", "plant-based"],
        "diets": ["vegetarian", "vegan", "gluten_free"],
    },
    {
        "name": "Greek Yogurt Power Parfait",
        "mealType": "Snack",
        "calories": 220,
        "protein": 20,
        "carbs": 26,
        "fat": 5,
        "prepTime": 3,
        "description": "Greek yogurt layered with berries, hemp seeds, and cacao nibs.",
        "tags": ["high protein", "sweet tooth"],
        "diets": ["standard", "vegetarian"],
    },
    {
        "name": "Berry Beet Recovery Smoothie",
        "mealType": "Snack",
        "calories": 240,
        "protein": 21,
        "carbs": 32,
        "fat": 6,
        "prepTime": 5,
        "description": "Whey or pea protein blended with beets, berries, and coconut water.",
        "tags": ["post-workout"],
        "diets": ["standard", "vegetarian", "vegan", "gluten_free"],
    },
    {
        "name": "Roasted Chickpea Trail Mix",
        "mealType": "Snack",
        "calories": 260,
        "protein": 12,
        "carbs": 28,
        "fat": 11,
        "prepTime": 10,
        "description": "Crunchy chickpeas with almonds, pumpkin seeds, and dried cherries.",
        "tags": ["portable"],
        "diets": ["vegetarian", "vegan", "gluten_free"],
    },
]


MEAL_SPLITS = {
    "Breakfast": 0.25,
    "Lunch": 0.3,
    "Dinner": 0.3,
    "Snack": 0.15,
}

MACRO_SPLITS: Dict[NutritionGoal, Dict[str, float]] = {
    NutritionGoal.fat_loss: {"protein": 0.35, "carbs": 0.35, "fat": 0.30},
    NutritionGoal.maintain: {"protein": 0.30, "carbs": 0.40, "fat": 0.30},
    NutritionGoal.muscle_gain: {"protein": 0.32, "carbs": 0.45, "fat": 0.23},
}

GOAL_CALORIE_MODIFIERS = {
    NutritionGoal.fat_loss: 0.85,
    NutritionGoal.maintain: 1.0,
    NutritionGoal.muscle_gain: 1.15,
}

HYDRATION_GUIDE = {
    NutritionGoal.fat_loss: 10,
    NutritionGoal.maintain: 9,
    NutritionGoal.muscle_gain: 12,
}

DAY_FOCUS = [
    "High-energy training day support",
    "Balanced fuel for accessory work",
    "Recovery-forward nourishment",
    "Micro-cycle reset",
    "Performance push day",
]

DIET_HIGHLIGHTS = {
    DietPreference.standard: ["Lean proteins", "Slow carbs", "Colorful veggies"],
    DietPreference.vegetarian: ["Plant proteins", "Fermented dairy", "Iron-rich greens"],
    DietPreference.vegan: ["Complete plant proteins", "Healthy fats", "Vitamin B12 sources"],
    DietPreference.pescatarian: ["Omega-3 rich fish", "Seasonal produce", "Mineral-dense sides"],
    DietPreference.gluten_free: ["Naturally gluten-free grains", "Colorful produce", "Gut-friendly fibers"],
}

GOAL_TIPS = {
    NutritionGoal.fat_loss: [
        "Anchor each meal with 25-30g of protein to stay satiated.",
        "Stack veggies at lunch for volume without the bloat.",
        "Keep snacks focused on lean protein + fiber combos.",
    ],
    NutritionGoal.maintain: [
        "Balance plates with protein, color, and complex carbs.",
        "Use snacks to bridge longer gaps between sessions.",
        "Stay hydrated and salt meals around training windows.",
    ],
    NutritionGoal.muscle_gain: [
        "Include a slow-carb and healthy fat in every main meal.",
        "Add an evening protein-rich snack to support recovery.",
        "Sip electrolytes when sessions run longer than 60 minutes.",
    ],
}

MEAL_COACH_TIPS = [
    "Double prep breakfast tonight so the morning starts on autopilot.",
    "Log meals in your tracker before lunch to reinforce targets.",
    "Batch cook grains so dinners assemble in under 10 minutes.",
    "Fill a 24oz bottle now to cover the next two hydration cups.",
    "Review tomorrow's snacks and keep one visible at your workstation.",
]


PROVIDER_SAMPLES: Dict[str, List[Dict[str, Optional[str]]]] = {
    "apple_health": [
        {
            "timestamp": "2024-10-01T07:30:00+00:00",
            "steps": 10320,
            "sleepHours": 7.8,
            "readiness": 86,
            "energyLevel": "steady",
            "comment": "Desk day with morning run.",
        },
        {
            "timestamp": "2024-09-30T07:30:00+00:00",
            "steps": 8920,
            "sleepHours": 6.9,
            "readiness": 74,
        },
    ],
    "fitbit": [
        {
            "timestamp": "2024-10-01T06:45:00+00:00",
            "steps": 6520,
            "sleepHours": 5.4,
            "readiness": 58,
            "energyLevel": "low",
            "comment": "Flight delay – need recovery day",
        }
    ],
    "whoop": [
        {
            "timestamp": "2024-10-01T08:00:00+00:00",
            "readiness": 72,
            "energyLevel": "steady",
            "comment": "Moderate strain 8.6 yesterday",
        }
    ],
}


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
_wellness_log: List[WellnessMetric] = []
_schedules: Dict[str, ScheduleResponse] = {}


def _load_persistent_state() -> None:
    schedules_raw, wellness_raw = load_storage()
    for key, payload in schedules_raw.items():
        try:
            _schedules[key] = ScheduleResponse(**payload)
        except Exception:
            continue
    for entry in wellness_raw:
        try:
            _wellness_log.append(WellnessMetric(**entry))
        except Exception:
            continue


def _persist_state() -> None:
    schedule_payload = {key: schedule.model_dump() for key, schedule in _schedules.items()}
    wellness_payload = [metric.model_dump() for metric in _wellness_log]
    save_storage(schedule_payload, wellness_payload)

WINDOW_LABELS = {
    "early_morning": "early morning",
    "pre_work": "before work",
    "midday": "midday",
    "late_afternoon": "late afternoon",
    "evening": "evening",
    "weekend": "weekend focus",
}

DEFAULT_WINDOWS = ["early_morning", "midday", "evening"]

GOAL_FOCUS_MAP = {
    NutritionGoal.fat_loss: ["Metabolic circuit", "Strength maintenance", "Cardio interval"],
    NutritionGoal.maintain: ["Strength balance", "Mobility + core", "Conditioning mix"],
    NutritionGoal.muscle_gain: ["Heavy strength", "Accessory build", "Recovery primer"],
}

GOAL_INTENSITY_MAP = {
    NutritionGoal.fat_loss: ["moderate", "moderate", "high"],
    NutritionGoal.maintain: ["moderate", "easy", "moderate"],
    NutritionGoal.muscle_gain: ["high", "moderate", "easy"],
}

EQUIPMENT_PRIORITIES = {
    "full_gym": "full gym",
    "dumbbells": "dumbbells",
    "kettlebell": "kettlebell",
    "bands": "bands",
    "bodyweight": "bodyweight",
    "outdoors": "outdoor",
}

READINESS_INSIGHTS = {
    "low": "Latest readiness flagged under 60 — keep the first session lighter and extend cooldowns.",
    "high": "Readiness is elevated — consider adding one bonus finisher if energy stays high.",
}

SLEEP_INSIGHT = "Sleep dipped below 6 hours. Keep today mobility-heavy and schedule an earlier cutoff tonight."

STRESS_INSIGHTS = {
    "high": "Stress level high — layer in breath work and swap one session for restorative flow.",
    "low": "Stress tracking low — template leans into progressive overload blocks.",
}

HYDRATION_PROMPTS = [
    "Front-load two cups of water before 10 AM.",
    "Add electrolytes to the post-session drink on tougher days.",
    "Keep a bottle at your desk and refill during standing breaks.",
]


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

_load_persistent_state()


def _filter_meals_for_diet(meal_type: str, diet: DietPreference) -> List[Dict[str, object]]:
    candidates = [meal for meal in MEAL_LIBRARY if meal["mealType"] == meal_type]
    if diet == DietPreference.standard:
        return candidates

    filtered = [meal for meal in candidates if diet.value in meal.get("diets", [])]
    return filtered or candidates


def _normalise_target_calories(request: MealPlanRequest) -> int:
    baseline = request.calories or 2200
    modifier = GOAL_CALORIE_MODIFIERS.get(request.goal, 1.0)
    target = int(round(baseline * modifier))
    # keep within sensible bounds
    return max(1500, min(target, 4200))


def _compute_macro_targets(calories: int, goal: NutritionGoal) -> MacroTargets:
    splits = MACRO_SPLITS.get(goal, MACRO_SPLITS[NutritionGoal.maintain])
    protein = int(round((calories * splits["protein"]) / 4))
    carbs = int(round((calories * splits["carbs"]) / 4))
    fat = int(round((calories * splits["fat"]) / 9))
    return MacroTargets(protein=protein, carbs=carbs, fat=fat)


def _macros_from_meals(meals: Sequence[Dict[str, object]]) -> MacroTargets:
    protein = sum(int(meal.get("protein", 0) or 0) for meal in meals)
    carbs = sum(int(meal.get("carbs", 0) or 0) for meal in meals)
    fat = sum(int(meal.get("fat", 0) or 0) for meal in meals)
    return MacroTargets(protein=protein, carbs=carbs, fat=fat)


def _coach_tip_for_day(index: int, preference_text: str, hydration_cups: int) -> str:
    base_tip = MEAL_COACH_TIPS[index % len(MEAL_COACH_TIPS)]
    if preference_text:
        base_tip = f"{base_tip} Lean into {preference_text} inspired spices."
    hydration_tip = HYDRATION_PROMPTS[index % len(HYDRATION_PROMPTS)]
    return f"{base_tip} {hydration_tip} Target {hydration_cups} cups today."


def _ordered_unique(values: Sequence[str]) -> List[str]:
    seen = set()
    ordered: List[str] = []
    for value in values:
        if value not in seen:
            ordered.append(value)
            seen.add(value)
    return ordered


def _build_meal_plan(request: MealPlanRequest) -> MealPlanResponse:
    target_calories = _normalise_target_calories(request)
    per_meal_targets = {
        meal_type: max(180 if meal_type == "Snack" else 260, int(target_calories * ratio))
        for meal_type, ratio in MEAL_SPLITS.items()
    }

    days: List[MealPlanDay] = []
    restrictions = [item.strip().lower() for item in request.restrictions + request.allergies if item.strip()]
    preference_text = (request.preferences or "").lower()
    hydration_target = HYDRATION_GUIDE.get(request.goal, 9)

    rotation_indices = {meal_type: 0 for meal_type in MEAL_SPLITS.keys()}
    aggregate_macros = {"protein": 0, "carbs": 0, "fat": 0}
    rotation_tracker: List[str] = []

    for index in range(request.days):
        focus = DAY_FOCUS[index % len(DAY_FOCUS)]
        day_label = f"Day {index + 1}"
        selected_meals: List[MealIdea] = []
        raw_meals: List[Dict[str, object]] = []
        total_calories = 0

        for meal_type in MEAL_SPLITS.keys():
            candidates = _filter_meals_for_diet(meal_type, request.diet)
            if not candidates:
                continue

            sorted_candidates = sorted(
                candidates,
                key=lambda meal: abs(meal["calories"] - per_meal_targets[meal_type]),
            )
            filtered_candidates = [
                meal
                for meal in sorted_candidates
                if not restrictions
                or not any(
                    keyword
                    in (
                        " ".join(
                            [
                                meal["name"],
                                meal.get("description", ""),
                                " ".join(meal.get("tags", [])),
                            ]
                        ).lower()
                    )
                    for keyword in restrictions
                )
            ]

            candidates_pool = filtered_candidates or sorted_candidates
            rotation_offset = rotation_indices[meal_type]
            chosen = candidates_pool[(index + rotation_offset) % len(candidates_pool)]
            rotation_indices[meal_type] = (rotation_offset + 1) % len(candidates_pool)

            meal_payload = {
                key: chosen[key]
                for key in [
                    "name",
                    "mealType",
                    "calories",
                    "protein",
                    "carbs",
                    "fat",
                    "prepTime",
                    "description",
                    "tags",
                ]
            }
            selected_meals.append(MealIdea(**meal_payload))
            raw_meals.append(meal_payload)
            rotation_tracker.append(str(meal_payload["name"]))
            total_calories += int(chosen["calories"])

        day_macro = _macros_from_meals(raw_meals)
        aggregate_macros["protein"] += day_macro.protein
        aggregate_macros["carbs"] += day_macro.carbs
        aggregate_macros["fat"] += day_macro.fat

        coach_tip = _coach_tip_for_day(index, preference_text, hydration_target)

        days.append(
            MealPlanDay(
                day=day_label,
                focus=focus,
                totalCalories=total_calories,
                meals=selected_meals,
                coachTip=coach_tip,
                macros=day_macro.model_dump(),
            )
        )

    average_macro = MacroTargets(
        protein=int(round(aggregate_macros["protein"] / max(len(days), 1))),
        carbs=int(round(aggregate_macros["carbs"] / max(len(days), 1))),
        fat=int(round(aggregate_macros["fat"] / max(len(days), 1))),
    )

    highlights = list(DIET_HIGHLIGHTS.get(request.diet, []))
    tips = list(GOAL_TIPS.get(request.goal, []))

    if preference_text:
        highlights.append(f"Flavor focus: {preference_text}")
    if request.activityLevel:
        highlights.append(f"Activity level: {request.activityLevel}")
    if request.supplements:
        tips.append(f"Keep supplements on schedule: {request.supplements}.")
    if request.weightGoalShort:
        tips.append(f"Short-term goal: {request.weightGoalShort}.")
    if request.weightGoalLong:
        tips.append(f"Long-term goal: {request.weightGoalLong}.")

    hydration_prompt = HYDRATION_PROMPTS[len(days) % len(HYDRATION_PROMPTS)]
    tips.append(hydration_prompt)

    summary = MealPlanSummary(
        targetCalories=target_calories,
        goal=request.goal,
        diet=request.diet,
        hydrationCups=hydration_target,
        macroTargets=_compute_macro_targets(target_calories, request.goal),
        actualMacros=average_macro,
        highlights=highlights,
        tips=tips,
    )

    rotation = _ordered_unique(rotation_tracker)

    return MealPlanResponse(summary=summary, days=days, rotation=rotation)


def _pick_windows(preferred: List[str]) -> List[str]:
    valid = [window for window in preferred if window in WINDOW_LABELS]
    return valid or DEFAULT_WINDOWS


def _friendly_window(window_key: str) -> str:
    return WINDOW_LABELS.get(window_key, window_key.replace("_", " "))


def _preferred_equipment(access: List[str]) -> str:
    lowered = {item.lower() for item in access}
    for key, label in EQUIPMENT_PRIORITIES.items():
        if key in lowered:
            return label
    return "bodyweight"


def _session_focus(goal: NutritionGoal, index: int) -> str:
    options = GOAL_FOCUS_MAP.get(goal, GOAL_FOCUS_MAP[NutritionGoal.maintain])
    return options[index % len(options)]


def _session_intensity(goal: NutritionGoal, index: int) -> str:
    options = GOAL_INTENSITY_MAP.get(goal, GOAL_INTENSITY_MAP[NutritionGoal.maintain])
    return options[index % len(options)]


def _profile_hash(request: ScheduleRequest) -> str:
    payload = "|".join(
        [
            request.fullName or "",
            request.occupation or "",
            request.workStyle or "",
            request.timezone or "",
            request.goal.value,
            ",".join(sorted(request.preferredWindows)),
            ",".join(sorted(request.equipmentAccess)),
            request.dietPreference.value,
            str(request.commuteMinutes or 0),
            (request.stressLevel or ""),
            str(request.age or ""),
            request.gender or "",
            request.activityLevel or "",
            request.injuries or "",
            request.dietaryRestrictions or "",
            request.dietaryAllergies or "",
            request.dietaryPreferences or "",
            request.supplements or "",
            request.weightGoalShort or "",
            request.weightGoalLong or "",
        ]
    )
    return sha1(payload.encode("utf-8")).hexdigest()


def _latest_wellness_metric() -> Optional[WellnessMetric]:
    if not _wellness_log:
        return None
    return _wellness_log[-1]


def _build_schedule_plan(request: ScheduleRequest) -> ScheduleResponse:
    windows = _pick_windows(request.preferredWindows)
    equipment = _preferred_equipment(request.equipmentAccess)
    target_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    if "weekend" in windows:
        target_days.append("Saturday")

    sessions: List[ScheduledSession] = []
    insights: List[str] = []
    base_duration = 30 if request.goal == NutritionGoal.fat_loss else 35

    activity = (request.activityLevel or "moderate").lower()
    if activity == "sedentary":
        base_duration -= 5
    elif activity == "high":
        base_duration += 5

    injuries = (request.injuries or "").lower()
    has_knee_issue = "knee" in injuries or "ankle" in injuries
    has_back_issue = "back" in injuries or "spine" in injuries

    latest_metric = _latest_wellness_metric()
    readiness_adjustment = 0
    if latest_metric and latest_metric.readiness is not None:
        if latest_metric.readiness < 60:
            readiness_adjustment = -5
            insights.append(READINESS_INSIGHTS["low"])
        elif latest_metric.readiness > 85:
            readiness_adjustment = 5
            insights.append(READINESS_INSIGHTS["high"])

    sleep_adjustment = 0
    if latest_metric and latest_metric.sleepHours is not None and latest_metric.sleepHours < 6:
        sleep_adjustment = -5
        insights.append(SLEEP_INSIGHT)

    for index, day in enumerate(target_days):
        window_key = windows[index % len(windows)]
        focus = _session_focus(request.goal, index)
        intensity = _session_intensity(request.goal, index)
        if has_knee_issue and "High" in focus or has_knee_issue and intensity == "high":
            focus = "Low impact + mobility"
            intensity = "moderate"
        if has_back_issue and "strength" in focus.lower():
            focus = "Core stability + posture"
            intensity = "moderate"
        duration = base_duration + (5 if intensity == "high" else 0)
        duration += readiness_adjustment + sleep_adjustment
        duration = max(20, duration)
        sessions.append(
            ScheduledSession(
                day=day,
                window=_friendly_window(window_key),
                focus=focus,
                durationMinutes=duration,
                equipment=equipment,
                intensity=intensity,
            )
        )

    stress = (request.stressLevel or "moderate").lower()
    if stress == "high":
        recovery_tip = "High stress flagged—add an extra mobility or breath session after dinner."
        insights.append(STRESS_INSIGHTS["high"])
    elif stress == "low":
        recovery_tip = "Low stress. Keep one mobility check-in to stay ahead of tightness."
        insights.append(STRESS_INSIGHTS["low"])
    else:
        recovery_tip = "Moderate stress. Mix in a short walk after lunch to reset energy."

    diet_label = request.dietPreference.value.replace("_", " ")
    meal_alignment = (
        f"Meals lean toward {diet_label} options with matching protein targets."
    )
    if request.dietaryRestrictions:
        meal_alignment += f" Avoiding: {request.dietaryRestrictions}."
    if request.dietaryPreferences:
        meal_alignment += f" Highlighting favorites: {request.dietaryPreferences}."

    summary_text = f"Plan built around {equipment} sessions in your {_friendly_window(windows[0])} window."
    if request.weightGoalShort:
        summary_text += f" Short-term focus: {request.weightGoalShort}."
    if request.weightGoalLong:
        summary_text += f" Long-term aim: {request.weightGoalLong}."

    notes = ScheduleNotes(
        summary=summary_text,
        recoveryTip=recovery_tip,
        mealAlignment=meal_alignment,
    )

    if readiness_adjustment < 0 or stress == "high":
        sessions.append(
            ScheduledSession(
                day="Flex Day",
                window="On-demand",
                focus="Recovery flow + guided breath",
                durationMinutes=20,
                equipment="bodyweight",
                intensity="easy",
            )
        )
        insights.append("Recovery buffer added to protect energy budget this week.")

    return ScheduleResponse(sessions=sessions, notes=notes, insights=_ordered_unique(insights))


def _macro_summary_text(targets: MacroTargets) -> str:
    return f"{targets.protein}g protein · {targets.carbs}g carbs · {targets.fat}g fat"


def _compile_takeaways(
    schedule: ScheduleResponse, meal_plan: MealPlanResponse, focus_areas: Sequence[str]
) -> List[str]:
    focus_lookup = {area.lower() for area in focus_areas}
    takeaways: List[str] = [
        schedule.notes.summary,
        schedule.notes.mealAlignment,
        f"Macro target: {_macro_summary_text(meal_plan.summary.macroTargets)}",
    ]
    if schedule.insights:
        takeaways.extend(schedule.insights)
    if "recovery" in focus_lookup or "stress" in focus_lookup:
        takeaways.append("Coach emphasis: prioritize recovery modalities twice this week.")
    if meal_plan.summary.actualMacros != meal_plan.summary.macroTargets:
        takeaways.append(
            f"Actual daily macros average {_macro_summary_text(meal_plan.summary.actualMacros)}."
        )
    return _ordered_unique(takeaways)


def _build_coach_actions(
    schedule: ScheduleResponse, meal_plan: MealPlanResponse, focus_areas: Sequence[str]
) -> List[CoachAction]:
    actions: List[CoachAction] = []
    focus_lookup = {area.lower() for area in focus_areas}

    if schedule.sessions:
        first_session = schedule.sessions[0]
        actions.append(
            CoachAction(
                headline=f"Lock {first_session.focus} on {first_session.day}",
                description=(
                    f"Block {first_session.durationMinutes} minutes in the {first_session.window} window. "
                    "Lay out equipment tonight so the session starts friction-free."
                ),
            )
        )

    if meal_plan.days and meal_plan.days[0].meals:
        top_meal = meal_plan.days[0].meals[0]
        actions.append(
            CoachAction(
                headline=f"Prep {top_meal.name}",
                description=(
                    f"Set aside {top_meal.prepTime} minutes to prep {top_meal.mealType.lower()} for Day 1. "
                    "Batch one extra portion to cover a busy morning."
                ),
            )
        )

    metric = _latest_wellness_metric()
    if metric and metric.sleepHours and metric.sleepHours < 7:
        actions.append(
            CoachAction(
                headline="Prioritise sleep hygiene tonight",
                description="Aim for lights-out 30 minutes earlier and keep screens outside the bedroom.",
            )
        )

    if "travel" in focus_lookup:
        actions.append(
            CoachAction(
                headline="Pack travel-friendly snacks",
                description="Use sealed containers for nuts and protein powder to stay aligned with macros on the go.",
            )
        )

    if not actions:
        actions.append(
            CoachAction(
                headline="Check in with the coach",
                description="Log a quick journal entry after tomorrow's session to keep the adaptive plan dialled in.",
            )
        )

    return actions


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


@app.get("/fit/meal-plan", response_model=MealPlanResponse)
def sample_meal_plan() -> MealPlanResponse:
    return _build_meal_plan(MealPlanRequest())


@app.post("/fit/meal-plan", response_model=MealPlanResponse)
def generate_meal_plan(request: MealPlanRequest) -> MealPlanResponse:
    return _build_meal_plan(request)


@app.post("/fit/schedule", response_model=ScheduleResponse)
def generate_schedule(request: ScheduleRequest) -> ScheduleResponse:
    profile_key = _profile_hash(request)
    schedule = _build_schedule_plan(request)
    _schedules[profile_key] = schedule
    _persist_state()
    return schedule


@app.get("/fit/schedule", response_model=ScheduleResponse)
def fetch_schedule(profileHash: str) -> ScheduleResponse:
    if profileHash not in _schedules:
        raise HTTPException(status_code=404, detail="Schedule not found for profile")
    return _schedules[profileHash]


@app.post("/fit/schedule/fetch", response_model=ScheduleResponse)
def fetch_schedule_by_profile(request: ScheduleRequest) -> ScheduleResponse:
    profile_key = _profile_hash(request)
    if profile_key not in _schedules:
        raise HTTPException(status_code=404, detail="Schedule not found for profile")
    return _schedules[profile_key]


@app.post("/fit/coach/recommendation", response_model=CoachRecommendation)
def generate_coach_recommendation(payload: CoachRecommendationRequest) -> CoachRecommendation:
    schedule_request = payload.schedule
    profile_key = _profile_hash(schedule_request)
    schedule = _build_schedule_plan(schedule_request)
    _schedules[profile_key] = schedule

    meal_request = payload.mealPlan or MealPlanRequest(
        goal=schedule_request.goal,
        diet=schedule_request.dietPreference,
        days=3,
    )
    meal_plan = _build_meal_plan(meal_request)

    takeaways = _compile_takeaways(schedule, meal_plan, payload.focusAreas)
    actions = _build_coach_actions(schedule, meal_plan, payload.focusAreas)

    _persist_state()

    return CoachRecommendation(
        profileHash=profile_key,
        schedule=schedule,
        mealPlan=meal_plan,
        takeaways=takeaways,
        nextActions=actions,
    )


@app.post("/fit/wellness-sync", response_model=Dict[str, str])
def record_wellness_metric(metric: WellnessMetric) -> Dict[str, str]:
    _wellness_log.append(metric)
    if len(_wellness_log) > 200:
        del _wellness_log[0]
    _persist_state()
    return {"status": "recorded"}


@app.get("/fit/wellness-sync", response_model=List[WellnessMetric])
def list_wellness_metrics(limit: int = 20) -> List[WellnessMetric]:
    if limit <= 0:
        return []
    return _wellness_log[-limit:]


class WellnessImportPayload(BaseModel):
    source: str
    entries: List[WellnessMetric]


@app.post("/fit/wellness-sync/import", response_model=Dict[str, str])
def import_wellness_metrics(payload: WellnessImportPayload) -> Dict[str, str]:
    for entry in payload.entries:
        entry.source = payload.source
        _wellness_log.append(entry)
    if len(_wellness_log) > 200:
        del _wellness_log[:-200]
    _persist_state()
    return {"status": "imported", "count": str(len(payload.entries))}


@app.get("/fit/wellness-sync/provider/{provider}", response_model=List[WellnessMetric])
def fetch_provider_sample(provider: str) -> List[WellnessMetric]:
    provider_key = provider.lower()
    if provider_key not in PROVIDER_SAMPLES:
        raise HTTPException(status_code=404, detail="Provider not supported")
    try:
        payload = fetch_provider_payload(provider_key, PROVIDER_SAMPLES[provider_key])
    except ProviderFetchError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return [WellnessMetric(source=provider_key, **entry) for entry in payload]
