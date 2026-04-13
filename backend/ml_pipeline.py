import logging
import pickle
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeRegressor


logger = logging.getLogger(__name__)
ROOT_DIR = Path(__file__).parent
MODEL_DIR = ROOT_DIR / "model"
DATASET_DIR = ROOT_DIR / "dataset"
MODEL_PATH = MODEL_DIR / "student_performance_model.pkl"
DATASET_PATH = DATASET_DIR / "student_performance_synthetic.csv"

FEATURE_COLUMNS = [
    "study_hours_per_day",
    "attendance_percentage",
    "previous_exam_score",
    "assignments_completed",
    "sleep_hours",
    "participation_in_class",
    "internet_usage_time",
    "extra_study_activities",
    "stress_level",
]

NUMERIC_FEATURES = [
    "study_hours_per_day",
    "attendance_percentage",
    "previous_exam_score",
    "assignments_completed",
    "sleep_hours",
    "internet_usage_time",
    "extra_study_activities",
]

CATEGORICAL_FEATURES = [
    "participation_in_class",
    "stress_level",
]

CATEGORY_COLORS = {
    "Excellent": "#10B981",
    "Average": "#F59E0B",
    "Needs Improvement": "#EF4444",
}

_MODEL_CACHE = None


def generate_synthetic_dataset(size: int = 2400, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    study_hours = np.clip(rng.normal(4.7, 1.6, size), 0.5, 9.0)
    attendance = np.clip(rng.normal(84, 10, size), 52, 100)
    previous_score = np.clip(rng.normal(71, 13, size), 35, 99)
    assignments_completed = np.clip(rng.normal(80, 15, size), 30, 100)
    sleep_hours = np.clip(rng.normal(7.1, 1.1, size), 4.0, 10.0)
    participation = rng.choice(["low", "medium", "high"], p=[0.2, 0.5, 0.3], size=size)
    internet_usage = np.clip(rng.normal(3.4, 1.8, size), 0.0, 9.0)
    extra_study = rng.choice([True, False], p=[0.56, 0.44], size=size)
    stress_level = rng.choice(["low", "medium", "high"], p=[0.22, 0.48, 0.30], size=size)

    participation_bonus = pd.Series(participation).map({"low": -4.5, "medium": 0.0, "high": 5.0}).to_numpy()
    stress_penalty = pd.Series(stress_level).map({"low": 0.0, "medium": 4.5, "high": 10.0}).to_numpy()
    sleep_balance = 8.5 - np.abs(sleep_hours - 7.3) * 2.7
    consistency_bonus = np.minimum(study_hours, 6.0) * (attendance / 100) * 5.8
    extra_bonus = np.where(extra_study, 4.2, 0.0)
    noise = rng.normal(0, 4.8, size)

    final_score = (
        17
        + previous_score * 0.34
        + attendance * 0.20
        + assignments_completed * 0.17
        + study_hours * 5.15
        + sleep_balance
        + participation_bonus
        + consistency_bonus
        + extra_bonus
        - internet_usage * 1.18
        - stress_penalty
        + noise
    )

    df = pd.DataFrame(
        {
            "study_hours_per_day": np.round(study_hours, 1),
            "attendance_percentage": np.round(attendance, 1),
            "previous_exam_score": np.round(previous_score, 1),
            "assignments_completed": np.round(assignments_completed, 1),
            "sleep_hours": np.round(sleep_hours, 1),
            "participation_in_class": participation,
            "internet_usage_time": np.round(internet_usage, 1),
            "extra_study_activities": np.where(extra_study, 1, 0),
            "stress_level": stress_level,
            "final_score": np.clip(np.round(final_score, 1), 35, 99),
        }
    )
    return df


def build_preprocessor() -> ColumnTransformer:
    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("one_hot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )
    return ColumnTransformer(
        transformers=[
            ("numeric", numeric_pipeline, NUMERIC_FEATURES),
            ("categorical", categorical_pipeline, CATEGORICAL_FEATURES),
        ]
    )


def build_candidates() -> dict:
    return {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(
            n_estimators=220,
            max_depth=10,
            min_samples_leaf=2,
            random_state=42,
        ),
        "Decision Tree": DecisionTreeRegressor(
            max_depth=8,
            min_samples_leaf=4,
            random_state=42,
        ),
        "Gradient Boosting": GradientBoostingRegressor(
            random_state=42,
            n_estimators=220,
            learning_rate=0.05,
            max_depth=3,
        ),
    }


def train_model() -> dict:
    global _MODEL_CACHE

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    DATASET_DIR.mkdir(parents=True, exist_ok=True)

    df = generate_synthetic_dataset()
    df.to_csv(DATASET_PATH, index=False)

    x = df[FEATURE_COLUMNS]
    y = df["final_score"]

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=42,
    )

    metrics = []
    best_pipeline = None
    best_predictions = None
    best_model_name = None
    best_score_key = None

    for model_name, estimator in build_candidates().items():
        pipeline = Pipeline(
            steps=[("preprocessor", build_preprocessor()), ("model", estimator)]
        )
        pipeline.fit(x_train, y_train)
        predictions = pipeline.predict(x_test)
        metric = {
            "model_name": model_name,
            "r2_score": round(float(r2_score(y_test, predictions)), 4),
            "mean_absolute_error": round(float(mean_absolute_error(y_test, predictions)), 4),
        }
        metrics.append(metric)
        score_key = (metric["r2_score"], -metric["mean_absolute_error"])
        if best_score_key is None or score_key > best_score_key:
            best_score_key = score_key
            best_pipeline = pipeline
            best_predictions = predictions
            best_model_name = model_name

    residual_std = round(float(np.std(y_test - best_predictions)), 4)
    artifact = {
        "model": best_pipeline,
        "metrics": metrics,
        "best_model_name": best_model_name,
        "residual_std": residual_std,
        "feature_columns": FEATURE_COLUMNS,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    with MODEL_PATH.open("wb") as model_file:
        pickle.dump(artifact, model_file)

    logger.info("Student performance model trained. Best model: %s", best_model_name)
    _MODEL_CACHE = artifact
    return artifact


def load_or_train_model() -> dict:
    global _MODEL_CACHE

    if _MODEL_CACHE is not None:
        return _MODEL_CACHE

    try:
        if MODEL_PATH.exists():
            with MODEL_PATH.open("rb") as model_file:
                _MODEL_CACHE = pickle.load(model_file)
                return _MODEL_CACHE
    except Exception as exc:
        logger.warning("Existing ML artifact could not be loaded: %s", exc)

    return train_model()


def get_best_metric(artifact: dict) -> dict:
    return next(
        metric
        for metric in artifact["metrics"]
        if metric["model_name"] == artifact["best_model_name"]
    )


def categorize_score(score: float) -> str:
    if score >= 80:
        return "Excellent"
    if score >= 60:
        return "Average"
    return "Needs Improvement"


def sleep_quality_score(sleep_hours: float) -> float:
    return float(np.clip(1 - abs(sleep_hours - 7.3) / 4, 0, 1))


def calculate_confidence(payload: dict, artifact: dict) -> float:
    best_metric = get_best_metric(artifact)
    model_strength = np.clip(1 - best_metric["mean_absolute_error"] / 20, 0.64, 0.93)
    participation_value = {"low": 0.45, "medium": 0.72, "high": 0.88}[payload["participation_in_class"]]
    stress_value = {"low": 0.88, "medium": 0.72, "high": 0.52}[payload["stress_level"]]
    learning_habits = np.mean(
        [
            payload["attendance_percentage"] / 100,
            payload["assignments_completed"] / 100,
            min(payload["study_hours_per_day"], 8) / 8,
            sleep_quality_score(payload["sleep_hours"]),
            participation_value,
            stress_value,
            float(payload["extra_study_activities"]),
        ]
    )
    confidence = (model_strength * 0.72 + learning_habits * 0.28) * 100
    return round(float(np.clip(confidence, 62, 96)), 1)


def strongest_improvement_area(payload: dict) -> str:
    scores = {
        "study routine": min(payload["study_hours_per_day"], 8) / 8,
        "attendance": payload["attendance_percentage"] / 100,
        "assignment completion": payload["assignments_completed"] / 100,
        "sleep balance": sleep_quality_score(payload["sleep_hours"]),
    }
    return min(scores, key=scores.get)


def build_interpretation(payload: dict, predicted_score: float, category: str) -> str:
    weakest_area = strongest_improvement_area(payload)

    if category == "Excellent":
        return (
            f"You are likely to score {predicted_score:.1f}%. Your habits look strong overall — keep your "
            "study consistency and attendance stable."
        )
    if category == "Average":
        return (
            f"You are likely to score {predicted_score:.1f}%. You are on track for a solid result, and improving "
            f"your {weakest_area} could move you into the excellent range."
        )
    return (
        f"You are likely to score {predicted_score:.1f}%. Focus first on your {weakest_area} and reduce pressure "
        "through a steadier routine to improve your next outcome."
    )


def predict_student_performance(payload: dict) -> dict:
    normalized_payload = {
        **payload,
        "internet_usage_time": payload.get("internet_usage_time") or 0,
        "extra_study_activities": 1 if payload.get("extra_study_activities") else 0,
    }
    artifact = load_or_train_model()
    input_frame = pd.DataFrame([normalized_payload], columns=FEATURE_COLUMNS)
    predicted_score = round(float(np.clip(artifact["model"].predict(input_frame)[0], 0, 100)), 1)
    category = categorize_score(predicted_score)
    confidence = calculate_confidence(normalized_payload, artifact)
    interpretation = build_interpretation(normalized_payload, predicted_score, category)

    return {
        "predicted_score": predicted_score,
        "performance_category": category,
        "confidence": confidence,
        "interpretation": interpretation,
        "model_used": artifact["best_model_name"],
    }