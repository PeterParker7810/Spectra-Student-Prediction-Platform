import { Activity, AlertTriangle, Award, BarChart3, BrainCircuit, LineChart as LineChartIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const statCards = [
  {
    key: "total_predictions",
    label: "Total predictions",
    icon: Activity,
    testId: "dashboard-total-predictions",
  },
  {
    key: "average_score",
    label: "Average score",
    icon: Award,
    testId: "dashboard-average-score",
    suffix: "%",
  },
  {
    key: "highest_score",
    label: "Highest score",
    icon: BarChart3,
    testId: "dashboard-highest-score",
    suffix: "%",
  },
  {
    key: "at_risk_count",
    label: "At risk count",
    icon: AlertTriangle,
    testId: "dashboard-at-risk-count",
  },
];

export default function DashboardView({ data, loading }) {
  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="surface-card rounded-[28px] border-slate-800/80">
            <CardContent className="h-64 animate-pulse p-8" />
          </Card>
        ))}
      </div>
    );
  }

  const modelMetrics = data?.model_evaluation?.map((metric) => ({
    model: metric.model_name,
    r2: metric.r2_score,
    mae: metric.mean_absolute_error,
  })) || [];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, testId, suffix = "" }) => (
          <Card key={key} className="surface-card rounded-[24px] border-slate-800/80">
            <CardContent className="flex items-center justify-between gap-4 p-6">
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p data-testid={testId} className="font-heading mt-2 text-3xl font-black text-white">
                  {data?.summary?.[key] ?? 0}
                  {suffix}
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                <Icon className="h-5 w-5 text-cyan-300" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <Card className="surface-card rounded-[28px] border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Trend chart</p>
              <CardTitle className="mt-2 text-2xl font-black text-white">Prediction score trend</CardTitle>
            </div>
            <LineChartIcon className="h-5 w-5 text-cyan-300" />
          </CardHeader>
          <CardContent data-testid="dashboard-score-trend-chart" className="h-[320px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.score_trend || []}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="4 4" />
                <XAxis dataKey="label" stroke="#94A3B8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} domain={[40, 100]} />
                <Tooltip contentStyle={{ background: "#0A1128", border: "1px solid #334155", borderRadius: 16 }} />
                <Line type="monotone" dataKey="score" stroke="#06B6D4" strokeWidth={3} dot={{ fill: "#3B82F6", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="surface-card rounded-[28px] border-slate-800/80">
          <CardHeader className="pb-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Category split</p>
            <CardTitle className="mt-2 text-2xl font-black text-white">Performance distribution</CardTitle>
          </CardHeader>
          <CardContent data-testid="dashboard-category-distribution-chart" className="h-[320px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ background: "#0A1128", border: "1px solid #334155", borderRadius: 16 }} />
                <Pie data={data?.category_distribution || []} dataKey="count" nameKey="category" innerRadius={70} outerRadius={110} paddingAngle={3}>
                  {(data?.category_distribution || []).map((entry) => (
                    <Cell key={entry.category} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,1fr]">
        <Card className="surface-card rounded-[28px] border-slate-800/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Model evaluation</p>
              <CardTitle className="mt-2 text-2xl font-black text-white">Compared model performance</CardTitle>
            </div>
            <BrainCircuit className="h-5 w-5 text-cyan-300" />
          </CardHeader>
          <CardContent data-testid="dashboard-model-metrics-chart" className="h-[310px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelMetrics} barGap={10}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="4 4" />
                <XAxis dataKey="model" stroke="#94A3B8" tickLine={false} axisLine={false} interval={0} angle={-10} textAnchor="end" height={70} />
                <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0A1128", border: "1px solid #334155", borderRadius: 16 }} />
                <Legend />
                <Bar dataKey="r2" name="R² Score" fill="#3B82F6" radius={[12, 12, 0, 0]} />
                <Bar dataKey="mae" name="MAE" fill="#7C3AED" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="surface-card rounded-[28px] border-slate-800/80">
          <CardHeader className="pb-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Latest history</p>
            <CardTitle className="mt-2 text-2xl font-black text-white">Recent predictions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4" data-testid="dashboard-recent-predictions-list">
            {(data?.recent_predictions || []).length === 0 ? (
              <div data-testid="dashboard-empty-history" className="rounded-[24px] border border-dashed border-slate-700 bg-slate-950/40 p-6 text-sm text-slate-400">
                Submit your first prediction to see history and analytics here.
              </div>
            ) : (
              data.recent_predictions.map((prediction) => (
                <div
                  key={prediction.id}
                  data-testid={`dashboard-history-item-${prediction.id}`}
                  className="rounded-[22px] border border-slate-800 bg-slate-950/55 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-heading text-lg font-bold text-white">{prediction.predicted_score}%</p>
                      <p className="text-sm text-slate-400">
                        {prediction.performance_category} · {prediction.model_used}
                      </p>
                    </div>
                    <p className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                      {prediction.confidence}% confidence
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{prediction.interpretation}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}