import { BrainCircuit, ChartNoAxesCombined, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link, NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "Home", path: "/", testId: "nav-home-link" },
  { label: "Predict", path: "/predict", testId: "nav-predict-link" },
  { label: "Dashboard", path: "/dashboard", testId: "nav-dashboard-link" },
];

const navLinkClass = ({ isActive }) =>
  `rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
    isActive
      ? "border-cyan-400/60 bg-cyan-400/10 text-white shadow-[0_0_24px_rgba(6,182,212,0.12)]"
      : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-600 hover:text-white"
  }`;

export default function Layout() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-cover bg-center opacity-25"
        style={{
          backgroundImage:
            "url(https://static.prod-images.emergentagent.com/jobs/af2f1ccc-d4e9-4206-bba2-03c96cabc863/images/d8b6b1f8fb9354f73f1ef9abb18536b281008c6e7987bc0a8b55ee63e44ad8bc.png)",
        }}
      />
      <div aria-hidden="true" className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_30%),linear-gradient(180deg,#050A15_0%,#08101F_55%,#050A15_100%)]" />

      <div className="relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#050A15]/80 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-12">
            <Link
              to="/"
              data-testid="brand-home-link"
              className="flex items-center gap-3 text-white transition-opacity hover:opacity-90"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
                <BrainCircuit className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <p className="font-heading text-xl font-extrabold tracking-tight">Spectra</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Student analytics lab</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-3 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  data-testid={item.testId}
                  className={navLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <Link
              to="/predict"
              data-testid="header-cta-link"
              className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500"
            >
              <Sparkles className="h-4 w-4" />
              Predict now
            </Link>
          </div>
        </motion.header>

        <main className="mx-auto min-h-[calc(100vh-180px)] max-w-7xl px-6 py-10 md:px-12 md:py-14">
          <Outlet />
        </main>

        <footer className="border-t border-slate-800/70 bg-[#050A15]/70">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between md:px-12">
            <div>
              <p data-testid="footer-title" className="font-heading text-base font-semibold text-slate-200">
                Spectra Performance Predictor
              </p>
              <p data-testid="footer-copy">Academic forecasting for students, teachers, and institutions.</p>
            </div>
            <div className="flex items-center gap-2 text-slate-300" data-testid="footer-highlight">
              <ChartNoAxesCombined className="h-4 w-4 text-cyan-300" />
              ML-ready insights with saved prediction analytics.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}