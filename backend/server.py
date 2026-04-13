import asyncio
import logging
import os
from collections import Counter
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, FastAPI
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.middleware.cors import CORSMiddleware

from ml_pipeline import CATEGORY_COLORS, load_or_train_model, predict_student_performance
from models import (
    CategoryDistributionItem,
    DashboardResponse,
    DashboardSummary,
    ModelMetric,
    PredictionRecord,
    ScoreTrendPoint,
    StudentPredictionInput,
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Student Performance Prediction Platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def root():
    return {"message": "Student performance prediction API is running."}


def parse_prediction_record(document: dict) -> PredictionRecord:
    parsed = {**document}
    if isinstance(parsed.get("created_at"), str):
        parsed["created_at"] = datetime.fromisoformat(parsed["created_at"])
    return PredictionRecord(**parsed)


def build_summary(records: list[PredictionRecord]) -> DashboardSummary:
    if not records:
        return DashboardSummary(
            total_predictions=0,
            average_score=0,
            highest_score=0,
            at_risk_count=0,
            latest_score=0,
        )

    scores = [record.predicted_score for record in records]
    at_risk_count = sum(record.predicted_score < 60 for record in records)
    return DashboardSummary(
        total_predictions=len(records),
        average_score=round(sum(scores) / len(scores), 1),
        highest_score=round(max(scores), 1),
        at_risk_count=at_risk_count,
        latest_score=round(records[0].predicted_score, 1),
    )


def build_category_distribution(records: list[PredictionRecord]) -> list[CategoryDistributionItem]:
    counts = Counter(record.performance_category for record in records)
    return [
        CategoryDistributionItem(
            category=category,
            count=counts.get(category, 0),
            fill=CATEGORY_COLORS[category],
        )
        for category in ["Excellent", "Average", "Needs Improvement"]
    ]


def build_score_trend(records: list[PredictionRecord]) -> list[ScoreTrendPoint]:
    ordered_records = list(reversed(records[:12]))
    return [
        ScoreTrendPoint(
            label=record.created_at.strftime("%b %d"),
            score=round(record.predicted_score, 1),
        )
        for record in ordered_records
    ]


@api_router.get("/health")
async def health_check():
    artifact = load_or_train_model()
    return {
        "status": "ok",
        "best_model": artifact["best_model_name"],
        "trained_at": artifact["generated_at"],
    }


@api_router.post("/predict", response_model=PredictionRecord)
async def create_prediction(student_input: StudentPredictionInput):
    prediction_payload = predict_student_performance(student_input.model_dump())
    record = PredictionRecord(input=student_input, **prediction_payload)
    document = record.model_dump()
    document["created_at"] = document["created_at"].isoformat()
    await db.prediction_history.insert_one(document)
    return record


@api_router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard_data():
    history_documents = (
        await db.prediction_history.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    )
    records = [parse_prediction_record(document) for document in history_documents]
    artifact = load_or_train_model()
    model_metrics = [ModelMetric(**metric) for metric in artifact["metrics"]]

    return DashboardResponse(
        summary=build_summary(records),
        category_distribution=build_category_distribution(records),
        score_trend=build_score_trend(records),
        recent_predictions=records[:8],
        model_evaluation=model_metrics,
        best_model_name=artifact["best_model_name"],
    )


@api_router.get("/history", response_model=list[PredictionRecord])
async def get_prediction_history():
    history_documents = (
        await db.prediction_history.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    )
    return [parse_prediction_record(document) for document in history_documents]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await asyncio.to_thread(load_or_train_model)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()