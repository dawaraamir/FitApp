import importlib

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def app_module():
    import backend.main as backend_main

    return importlib.reload(backend_main)


@pytest.fixture()
def client(app_module) -> TestClient:
    return TestClient(app_module.app)


def test_meal_plan_macro_targets(client: TestClient, app_module) -> None:
    response = client.get("/fit/meal-plan")
    assert response.status_code == 200

    payload = response.json()
    summary = payload["summary"]

    assert "macroTargets" in summary
    assert summary["macroTargets"]["protein"] > 0
    assert summary["actualMacros"]["protein"] > 0
    assert payload["rotation"], "Expected meal rotation to surface unique meals"

    first_day = payload["days"][0]
    assert first_day["coachTip"]
    assert first_day["macros"]["protein"] > 0


def test_schedule_low_readiness_adds_insight_and_recovery(client: TestClient, app_module) -> None:
    wellness_payload = {
        "timestamp": "2024-10-02T07:00:00Z",
        "readiness": 55,
        "sleepHours": 5.5,
    }
    record = client.post("/fit/wellness-sync", json=wellness_payload)
    assert record.status_code == 200

    schedule_request = {
        "goal": "fat_loss",
        "dietPreference": "standard",
        "preferredWindows": ["early_morning", "midday"],
        "equipmentAccess": ["bodyweight"],
        "stressLevel": "high",
    }
    response = client.post("/fit/schedule", json=schedule_request)
    assert response.status_code == 200
    schedule = response.json()

    assert any("readiness" in insight.lower() for insight in schedule["insights"])
    assert any(session["day"] == "Flex Day" for session in schedule["sessions"])


def test_coach_recommendation_combines_plans(client: TestClient, app_module) -> None:
    recommendation_request = {
        "schedule": {
            "goal": "maintain",
            "dietPreference": "standard",
            "preferredWindows": ["midday", "evening"],
            "equipmentAccess": ["dumbbells"],
            "stressLevel": "moderate",
        },
        "mealPlan": {
            "goal": "maintain",
            "diet": "standard",
            "days": 3,
            "calories": 2100,
        },
        "focusAreas": ["Stress", "Travel"],
    }

    response = client.post("/fit/coach/recommendation", json=recommendation_request)
    assert response.status_code == 200
    payload = response.json()

    assert payload["profileHash"]
    assert payload["takeaways"], "Expected high-level takeaways for the coach summary"
    assert payload["nextActions"], "Coach actions should surface concrete next steps"
    assert payload["mealPlan"]["rotation"], "Meal rotation should be returned with recommendations"
