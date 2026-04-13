import { useState } from "react";
import { motion } from "framer-motion";

import PredictionForm from "../components/PredictionForm";
import PredictionResults from "../components/PredictionResults";

export default function PredictPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="grid gap-8"
      data-testid="predict-page"
    >
      <div className="max-w-3xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Prediction workspace</p>
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Build a student profile and estimate the likely outcome.</h1>
        <p className="text-base leading-relaxed text-slate-300">
          This view connects the student input form to the machine learning backend and stores each forecast for dashboard analytics.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <PredictionForm onResult={setResult} onLoadingChange={setLoading} />
        <PredictionResults result={result} loading={loading} />
      </div>
    </motion.div>
  );
}