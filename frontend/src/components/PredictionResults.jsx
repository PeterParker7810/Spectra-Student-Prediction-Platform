import { BrainCircuit, Gauge, Sparkles, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const categoryClasses = {
  Excellent: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Average: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  "Needs Improvement": "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

export default function PredictionResults({ result, loading }) {
  if (loading) {
    return (
      <Card className="surface-card rounded-[28px] border-slate-800/80">
        <CardContent className="flex min-h-[420px] flex-col justify-center gap-4 p-8">
          <p data-testid="prediction-loading-state" className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Prediction in progress
          </p>
          <h3 className="font-heading text-3xl font-black text-white">Running the model and saving your result…</h3>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="surface-card rounded-[28px] border-slate-800/80">
        <CardContent className="flex min-h-[420px] flex-col justify-between gap-8 p-8">
          <div className="space-y-4">
            <p data-testid="prediction-empty-overline" className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Result panel
            </p>
            <h3 data-testid="prediction-empty-title" className="font-heading text-3xl font-black tracking-tight text-white">
              Your predicted score will appear here.
            </h3>
            <p data-testid="prediction-empty-copy" className="text-sm leading-relaxed text-slate-300">
              Submit the form to view score percentage, category, confidence, and an interpretation message shaped by your learning habits.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [Gauge, "Score", "Percentage output with rounded estimate"],
              [TrendingUp, "Category", "Excellent, Average, or Needs Improvement"],
              [Sparkles, "Confidence", "Model certainty based on fit and consistency"],
            ].map(([Icon, label, detail]) => (
              <div key={label} data-testid={`result-preview-${label.toLowerCase()}-card`} className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
                <Icon className="mb-3 h-5 w-5 text-cyan-300" />
                <p className="font-heading text-lg font-bold text-white">{label}</p>
                <p className="mt-1 text-sm text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface-card rounded-[28px] border-blue-900/60 bg-gradient-to-b from-[#111B3D] to-[#0A1128]">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p data-testid="prediction-result-overline" className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Prediction outcome
            </p>
            <CardTitle data-testid="prediction-result-title" className="mt-2 text-3xl font-black tracking-tight text-white">
              Student performance forecast
            </CardTitle>
          </div>
          <div
            data-testid="prediction-category-badge"
            className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${categoryClasses[result.performance_category]}`}
          >
            {result.performance_category}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/55 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Predicted score</p>
            <p data-testid="prediction-score" className="font-heading mt-3 text-5xl font-black text-white">
              {result.predicted_score}%
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/55 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Confidence</p>
            <p data-testid="prediction-confidence" className="font-heading mt-3 text-4xl font-black text-cyan-300">
              {result.confidence}%
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/55 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Selected model</p>
            <p data-testid="prediction-model-used" className="font-heading mt-3 text-2xl font-black text-white">
              {result.model_used}
            </p>
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-800 bg-slate-950/55 p-6">
          <div className="mb-4 flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-cyan-300" />
            <p className="font-heading text-xl font-bold text-white">Interpretation</p>
          </div>
          <p data-testid="prediction-interpretation" className="text-base leading-relaxed text-slate-200">
            {result.interpretation}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-800 bg-slate-950/55 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Attendance snapshot</p>
            <p data-testid="result-attendance-snapshot" className="mt-2 text-lg font-semibold text-white">
              {result.input.attendance_percentage}% attendance · {result.input.assignments_completed}% assignments complete
            </p>
          </div>
          <div className="rounded-[24px] border border-slate-800 bg-slate-950/55 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Engagement snapshot</p>
            <p data-testid="result-engagement-snapshot" className="mt-2 text-lg font-semibold text-white">
              {result.input.participation_in_class} participation · {result.input.stress_level} stress · {result.input.sleep_hours}h sleep
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}