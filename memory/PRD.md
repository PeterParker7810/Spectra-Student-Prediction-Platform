# PRD — Student Performance Prediction Platform

## Original Problem Statement
Build a full-stack web application that predicts student academic performance using Machine Learning. The platform should allow users (students or teachers) to input relevant academic and lifestyle data, and the system should predict expected performance such as final grade, score percentage, or performance category (Excellent / Average / Needs Improvement).

## User Choices
- Output: both score percentage and performance category
- Dashboard: full dashboard with saved predictions and charts
- Dataset: realistic synthetic dataset now, but structured for future replacement
- Model strategy: automatically select the best practical model after evaluation
- Visual direction: modern academic blue gradient theme

## User Personas
1. Students who want to estimate their expected academic performance.
2. Teachers who want to identify students who may need support.
3. Institutions or project reviewers who want to view academic trend analytics.

## Architecture Decisions
- Frontend: React with React Router, Tailwind, Recharts, Framer Motion, and reusable UI components.
- Backend: FastAPI with response models for safe serialization.
- Database: MongoDB for prediction history storage.
- ML: Synthetic dataset generation, preprocessing pipeline, comparison across Linear Regression, Random Forest, Decision Tree, and Gradient Boosting.
- Model selection: best model chosen using R2 score with MAE tie-awareness.
- API design: `/api/health`, `/api/predict`, `/api/dashboard`, `/api/history`.

## Core Requirements
- Home page with hero, explanation, and CTA
- Prediction page with all academic/lifestyle fields
- Prediction output showing score, category, confidence, and interpretation
- Dashboard with history, trend charts, and model analytics
- Clean professional academic UI
- Organized code structure and responsive experience

## What’s Been Implemented
### 2026-04-13
- Built a branded multi-page React interface for Home, Predict, and Dashboard routes.
- Added a polished academic analytics theme with dark sapphire visuals, image-led hero, motion, and responsive layouts.
- Implemented the full prediction form with all requested inputs and saved prediction workflow.
- Built FastAPI endpoints for health, prediction, history, and dashboard aggregation.
- Added ML training pipeline with synthetic dataset generation, preprocessing, multi-model evaluation, best-model selection, and persisted model artifact.
- Stored prediction history in MongoDB and surfaced it in summary cards, trend chart, category distribution, model comparison chart, and recent predictions.
- Added testable `data-testid` coverage across key UI and flow elements.
- Completed self-testing plus external validation; automated testing report passed for backend and frontend.

## Prioritized Backlog
### P0
- No blocking P0 items currently open.

### P1
- Tune synthetic score distribution so top-end predictions are less saturated near 100.
- Add filter controls on dashboard for categories and recent ranges.
- Add downloadable CSV export for saved prediction history.

### P2
- Add teacher-specific cohort comparison views.
- Add authentication and private saved dashboards.
- Support replacing the synthetic dataset with a real uploaded dataset.
- Add deeper model explainability visuals such as feature influence summaries.

## Next Tasks List
1. Improve realism calibration for score outputs and confidence presentation.
2. Add dashboard filters and export actions.
3. Add optional comparison mode for multiple students.
4. Introduce explainability and teacher workflow enhancements.
