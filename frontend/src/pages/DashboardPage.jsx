import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import DashboardView from "../components/DashboardView";
import { fetchDashboard } from "../lib/api";
import { Button } from "../components/ui/button";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDashboard();
      setDashboardData(data);
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Could not load dashboard analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="grid gap-8"
      data-testid="dashboard-page"
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Analytics dashboard</p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Track prediction history, score movement, and model quality.</h1>
          <p className="text-base leading-relaxed text-slate-300">
            Every prediction is saved automatically, then visualized through score trends, category distribution, recent history, and evaluated model metrics.
          </p>
          <p data-testid="dashboard-best-model-name" className="text-sm font-medium text-slate-300">
            Current best model: <span className="text-white">{dashboardData?.best_model_name || "Loading"}</span>
          </p>
        </div>

        <Button
          onClick={loadDashboard}
          data-testid="dashboard-refresh-button"
          className="rounded-full bg-blue-600 px-6 text-white hover:bg-blue-500"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh dashboard
        </Button>
      </div>

      <DashboardView data={dashboardData} loading={loading} />
    </motion.div>
  );
}