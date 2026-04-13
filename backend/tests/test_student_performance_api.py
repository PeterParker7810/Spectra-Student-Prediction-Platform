"""API tests for student performance prediction and dashboard analytics flows."""

import os

import pytest
import requests


BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")


@pytest.fixture(scope="session")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="session")
def valid_payload():
    # Input schema and end-to-end prediction payload for ML inference.
    return {
        "study_hours_per_day": 5.2,
        "attendance_percentage": 91.0,
        "previous_exam_score": 78.5,
        "assignments_completed": 88.0,
        "sleep_hours": 7.1,
        "participation_in_class": "high",
        "internet_usage_time": 2.8,
        "extra_study_activities": True,
        "stress_level": "medium",
    }


def test_health_endpoint(api_client):
    response = api_client.get(f"{BASE_URL}/api/health", timeout=30)
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert isinstance(data["best_model"], str) and len(data["best_model"]) > 0
    assert isinstance(data["trained_at"], str) and len(data["trained_at"]) > 0


def test_predict_creates_record_with_expected_fields(api_client, valid_payload):
    response = api_client.post(f"{BASE_URL}/api/predict", json=valid_payload, timeout=60)
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["id"], str) and len(data["id"]) > 0
    assert 0 <= data["predicted_score"] <= 100
    assert data["performance_category"] in ["Excellent", "Average", "Needs Improvement"]
    assert 0 <= data["confidence"] <= 100
    assert isinstance(data["interpretation"], str) and len(data["interpretation"]) > 10
    assert isinstance(data["model_used"], str) and len(data["model_used"]) > 0
    assert data["input"]["participation_in_class"] == valid_payload["participation_in_class"]
    assert data["input"]["stress_level"] == valid_payload["stress_level"]


def test_predict_validation_error_for_invalid_range(api_client, valid_payload):
    invalid_payload = {**valid_payload, "attendance_percentage": 140}
    response = api_client.post(f"{BASE_URL}/api/predict", json=invalid_payload, timeout=30)
    assert response.status_code == 422

    data = response.json()
    assert "detail" in data


def test_history_contains_recent_prediction(api_client, valid_payload):
    create_response = api_client.post(f"{BASE_URL}/api/predict", json=valid_payload, timeout=60)
    assert create_response.status_code == 200
    created = create_response.json()

    history_response = api_client.get(f"{BASE_URL}/api/history", timeout=30)
    assert history_response.status_code == 200
    history = history_response.json()

    assert isinstance(history, list)
    assert len(history) > 0
    assert any(item["id"] == created["id"] for item in history)


def test_dashboard_response_structure_and_consistency(api_client):
    response = api_client.get(f"{BASE_URL}/api/dashboard", timeout=30)
    assert response.status_code == 200

    data = response.json()
    summary = data["summary"]
    assert isinstance(summary["total_predictions"], int)
    assert isinstance(summary["average_score"], (int, float))
    assert isinstance(summary["highest_score"], (int, float))
    assert isinstance(summary["at_risk_count"], int)
    assert isinstance(summary["latest_score"], (int, float))

    categories = data["category_distribution"]
    assert len(categories) == 3
    category_names = {item["category"] for item in categories}
    assert category_names == {"Excellent", "Average", "Needs Improvement"}

    assert isinstance(data["score_trend"], list)
    assert isinstance(data["recent_predictions"], list)
    assert isinstance(data["model_evaluation"], list)
    assert isinstance(data["best_model_name"], str) and len(data["best_model_name"]) > 0

    if data["model_evaluation"]:
        metric = data["model_evaluation"][0]
        assert isinstance(metric["model_name"], str)
        assert isinstance(metric["r2_score"], (int, float))
        assert isinstance(metric["mean_absolute_error"], (int, float))
