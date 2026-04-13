from datetime import datetime, timezone
from typing import List, Literal
from uuid import uuid4

from pydantic import BaseModel, Field


PerformanceCategory = Literal["Excellent", "Average", "Needs Improvement"]
LevelChoice = Literal["low", "medium", "high"]


class StudentPredictionInput(BaseModel):
    study_hours_per_day: float = Field(..., ge=0, le=16)
    attendance_percentage: float = Field(..., ge=0, le=100)
    previous_exam_score: float = Field(..., ge=0, le=100)
    assignments_completed: float = Field(..., ge=0, le=100)
    sleep_hours: float = Field(..., ge=0, le=16)
    participation_in_class: LevelChoice
    internet_usage_time: float = Field(default=0, ge=0, le=16)
    extra_study_activities: bool
    stress_level: LevelChoice


class ModelMetric(BaseModel):
    model_name: str
    r2_score: float
    mean_absolute_error: float


class PredictionRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    input: StudentPredictionInput
    predicted_score: float
    performance_category: PerformanceCategory
    confidence: float
    interpretation: str
    model_used: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DashboardSummary(BaseModel):
    total_predictions: int
    average_score: float
    highest_score: float
    at_risk_count: int
    latest_score: float


class CategoryDistributionItem(BaseModel):
    category: str
    count: int
    fill: str


class ScoreTrendPoint(BaseModel):
    label: str
    score: float


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    category_distribution: List[CategoryDistributionItem]
    score_trend: List[ScoreTrendPoint]
    recent_predictions: List[PredictionRecord]
    model_evaluation: List[ModelMetric]
    best_model_name: str