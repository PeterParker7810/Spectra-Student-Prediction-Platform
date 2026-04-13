import { useEffect, useState } from "react";
import { ArrowRight, ChartSpline, DatabaseZap, GraduationCap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { fetchHealth } from "../lib/api";

const featureCards = [
  {
    icon: GraduationCap,
    title: "Student-ready forecasting",
    description: "Estimate likely outcomes before exams using daily habits, attendance, and engagement signals.",
  },
  {
    icon: ChartSpline,
    title: "Teacher-friendly analytics",
    description: "Spot average trends and at-risk cases through a saved dashboard with visual summaries.",
  },
  {
    icon: DatabaseZap,
    title: "Machine learning pipeline",
    description: "Synthetic academic data, preprocessing, model comparison, and real prediction endpoints in one stack.",
  },
  {
    icon: ShieldCheck,
    title: "Portfolio-quality interface",
    description: "A polished academic experience designed for project demos, college reviews, and presentations.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.1, ease: "easeOut" },
  }),
};

export default function HomePage() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  return (
    <div className="grid gap-10">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        data-testid="home-hero-section"
        className="relative overflow-hidden rounded-[36px] border border-slate-800/80"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://static.prod-images.emergentagent.com/jobs/af2f1ccc-d4e9-4206-bba2-03c96cabc863/images/6843396fc5852169f9b6974104434a8e9e853d1115064c60e5636d0e43ae55b3.png)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050A15] via-[#050A15]/85 to-[#050A15]/35" />

        <div className="relative z-10 grid gap-10 px-6 py-16 md:px-10 lg:grid-cols-[1.2fr,0.8fr] lg:px-14 lg:py-20">
          <div className="max-w-3xl space-y-8">
            <div className="space-y-5">
              <p data-testid="hero-overline" className="text-xs font-bold uppercase tracking-[0.26em] text-cyan-300">
                ML-based academic insight platform
              </p>
              <h1 data-testid="hero-title" className="text-4xl font-black leading-none tracking-tighter text-white sm:text-5xl lg:text-6xl">
                Predict student outcomes with a <span className="accent-text">modern academic dashboard</span>.
              </h1>
              <p data-testid="hero-description" className="max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
                Spectra helps students, teachers, and institutions translate study behavior into expected performance using a trained machine learning model.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/predict"
                data-testid="hero-predict-performance-button"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Predict Performance
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard"
                data-testid="hero-dashboard-button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/40 px-6 py-3 text-sm font-semibold text-slate-100 transition-all duration-300 hover:border-slate-500 hover:bg-slate-900/70"
              >
                View dashboard
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Score output", "Predicted percentage + category"],
                ["Model comparison", "R² and MAE evaluation"],
                ["History tracking", "Saved results with trend charts"],
              ].map(([title, description], index) => (
                <motion.div
                  key={title}
                  custom={index + 1}
                  variants={fadeUp}
                  data-testid={`hero-stat-${index + 1}`}
                  className="rounded-[28px] border border-slate-800/70 bg-[#0A1128]/60 p-5 backdrop-blur-md"
                >
                  <p className="font-heading text-xl font-black text-white">{title}</p>
                  <p className="mt-2 text-sm text-slate-400">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div custom={2} variants={fadeUp} className="flex flex-col justify-end gap-4">
            <div className="surface-card rounded-[28px] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Live model status</p>
              <p data-testid="home-health-status" className="mt-3 font-heading text-3xl font-black text-white">
                {health?.status === "ok" ? "Ready for prediction" : "Connecting to model"}
              </p>
              <p data-testid="home-best-model" className="mt-2 text-sm text-slate-300">
                Best evaluated model: <span className="font-semibold text-white">{health?.best_model || "Loading"}</span>
              </p>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-[#0A1128]/70">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1713006615995-acc452dde2e2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwyfHx1bml2ZXJzaXR5JTIwc3R1ZGVudCUyMHN0dWR5aW5nJTIwbmlnaHR8ZW58MHx8fHwxNzc2MDcxOTIyfDA&ixlib=rb-4.1.0&q=85"
                  alt="Student studying"
                  className="h-full w-full object-cover object-center"
                  data-testid="home-support-image"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section className="grid gap-6 lg:grid-cols-4" data-testid="home-feature-grid">
        {featureCards.map((card, index) => (
          <motion.div key={card.title} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} custom={index} variants={fadeUp}>
            <div className="surface-card h-full rounded-[28px] p-6">
              <card.icon className="h-6 w-6 text-cyan-300" />
              <h2 className="mt-5 text-2xl font-black tracking-tight text-white">{card.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{card.description}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 rounded-[36px] border border-slate-800/80 bg-[#08101F]/75 p-6 md:p-10 lg:grid-cols-[0.95fr,1.05fr]" data-testid="home-how-it-works-section">
        <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950/55">
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img
              src="https://images.pexels.com/photos/17485657/pexels-photo-17485657.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              alt="AI and data visualization"
              className="h-full w-full object-cover object-center"
              data-testid="home-ml-image"
            />
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">How it works</p>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            A simple workflow backed by preprocessing, feature selection, and model evaluation.
          </h2>
          <div className="grid gap-4">
            {[
              "Students or teachers enter academic and lifestyle inputs in the prediction form.",
              "The backend loads the trained model selected from multiple evaluated regressors.",
              "Spectra returns predicted score, category, confidence, and a clear interpretation.",
              "Each prediction is saved to MongoDB so the dashboard can visualize history and trends.",
            ].map((step, index) => (
              <div key={step} data-testid={`workflow-step-${index + 1}`} className="rounded-[24px] border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
                <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/10 font-semibold text-cyan-200">
                  {index + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}