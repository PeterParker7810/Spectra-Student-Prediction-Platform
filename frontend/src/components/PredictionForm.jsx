import { useMemo, useState } from "react";
import { toast } from "sonner";

import { submitPrediction } from "../lib/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const initialForm = {
  study_hours_per_day: 4.5,
  attendance_percentage: 86,
  previous_exam_score: 74,
  assignments_completed: 82,
  sleep_hours: 7,
  participation_in_class: "medium",
  internet_usage_time: 3.5,
  extra_study_activities: true,
  stress_level: "medium",
};

const fieldGroups = [
  {
    id: "study_hours_per_day",
    label: "Study Hours per Day",
    step: "0.1",
    min: 0,
    max: 16,
  },
  {
    id: "attendance_percentage",
    label: "Attendance Percentage",
    step: "0.1",
    min: 0,
    max: 100,
  },
  {
    id: "previous_exam_score",
    label: "Previous Exam Score",
    step: "0.1",
    min: 0,
    max: 100,
  },
  {
    id: "assignments_completed",
    label: "Assignments Completed (%)",
    step: "0.1",
    min: 0,
    max: 100,
  },
  {
    id: "sleep_hours",
    label: "Sleep Hours",
    step: "0.1",
    min: 0,
    max: 16,
  },
  {
    id: "internet_usage_time",
    label: "Internet Usage Time (optional)",
    step: "0.1",
    min: 0,
    max: 16,
  },
];

export default function PredictionForm({ onResult, onLoadingChange }) {
  const [formData, setFormData] = useState(initialForm);

  const readiness = useMemo(() => {
    const habitScore =
      formData.attendance_percentage * 0.3 +
      formData.assignments_completed * 0.25 +
      formData.previous_exam_score * 0.2 +
      Math.min(formData.study_hours_per_day, 8) * 5 +
      Math.max(0, 100 - Math.abs(formData.sleep_hours - 7.2) * 12);
    return Math.min(100, Math.round(habitScore / 1.1));
  }, [formData]);

  const updateNumber = (key, value) => {
    setFormData((current) => ({ ...current, [key]: value === "" ? "" : Number(value) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    onLoadingChange?.(true);

    try {
      const payload = {
        ...formData,
        study_hours_per_day: Number(formData.study_hours_per_day),
        attendance_percentage: Number(formData.attendance_percentage),
        previous_exam_score: Number(formData.previous_exam_score),
        assignments_completed: Number(formData.assignments_completed),
        sleep_hours: Number(formData.sleep_hours),
        internet_usage_time: Number(formData.internet_usage_time || 0),
      };

      const result = await submitPrediction(payload);
      onResult(result);
      toast.success("Prediction generated and saved to your dashboard.");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Prediction failed. Please review the values.");
    } finally {
      onLoadingChange?.(false);
    }
  };

  return (
    <Card className="surface-card mesh-border relative overflow-hidden rounded-[28px]">
      <CardHeader className="space-y-4 pb-4">
        <p data-testid="prediction-form-overline" className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
          Student input profile
        </p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle data-testid="prediction-form-title" className="text-3xl font-black tracking-tight text-white">
              Predict academic performance
            </CardTitle>
            <p data-testid="prediction-form-description" className="mt-2 max-w-2xl text-sm text-slate-300">
              Enter learning habits, exam history, and class engagement to estimate score, category, confidence, and interpretation.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Readiness signal</p>
            <p data-testid="prediction-readiness-score" className="font-heading text-2xl font-extrabold text-white">
              {readiness}%
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form className="grid gap-6" onSubmit={handleSubmit} data-testid="prediction-form">
          <div className="grid gap-5 md:grid-cols-2">
            {fieldGroups.map((field) => (
              <div key={field.id} className="grid gap-2">
                <Label htmlFor={field.id} className="text-sm font-medium text-slate-200">
                  {field.label}
                </Label>
                <Input
                  id={field.id}
                  type="number"
                  step={field.step}
                  min={field.min}
                  max={field.max}
                  value={formData[field.id]}
                  onChange={(event) => updateNumber(field.id, event.target.value)}
                  data-testid={`${field.id}-input`}
                  className="h-12 rounded-2xl border-slate-700 bg-slate-950/70 text-white placeholder:text-slate-500 focus-visible:ring-cyan-400"
                />
              </div>
            ))}

            <div className="grid gap-2">
              <Label className="text-sm font-medium text-slate-200">Participation in Class</Label>
              <Select
                value={formData.participation_in_class}
                onValueChange={(value) => setFormData((current) => ({ ...current, participation_in_class: value }))}
              >
                <SelectTrigger data-testid="participation-in-class-select" className="h-12 rounded-2xl border-slate-700 bg-slate-950/70 text-white">
                  <SelectValue placeholder="Choose participation level" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-[#0A1128] text-white">
                  {["low", "medium", "high"].map((value) => (
                    <SelectItem key={value} value={value} data-testid={`participation-${value}-option`}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium text-slate-200">Extra Study Activities</Label>
              <Select
                value={formData.extra_study_activities ? "yes" : "no"}
                onValueChange={(value) => setFormData((current) => ({ ...current, extra_study_activities: value === "yes" }))}
              >
                <SelectTrigger data-testid="extra-study-activities-select" className="h-12 rounded-2xl border-slate-700 bg-slate-950/70 text-white">
                  <SelectValue placeholder="Choose yes or no" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-[#0A1128] text-white">
                  <SelectItem value="yes" data-testid="extra-study-yes-option">Yes</SelectItem>
                  <SelectItem value="no" data-testid="extra-study-no-option">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium text-slate-200">Stress Level</Label>
              <Select
                value={formData.stress_level}
                onValueChange={(value) => setFormData((current) => ({ ...current, stress_level: value }))}
              >
                <SelectTrigger data-testid="stress-level-select" className="h-12 rounded-2xl border-slate-700 bg-slate-950/70 text-white">
                  <SelectValue placeholder="Choose stress level" />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-[#0A1128] text-white">
                  {["low", "medium", "high"].map((value) => (
                    <SelectItem key={value} value={value} data-testid={`stress-${value}-option`}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-4 md:flex-row md:items-center md:justify-between">
            <p data-testid="prediction-form-helper" className="max-w-xl text-sm text-slate-400">
              Your prediction is stored automatically, so the dashboard updates with every new estimate.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData(initialForm)}
                data-testid="load-demo-values-button"
                className="rounded-full border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                Load demo values
              </Button>
              <Button
                type="submit"
                data-testid="predict-submit-button"
                className="rounded-full bg-blue-600 px-6 text-white hover:bg-blue-500"
              >
                Predict performance
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}