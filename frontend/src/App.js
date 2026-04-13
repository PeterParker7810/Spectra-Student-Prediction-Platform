import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import PredictPage from "./pages/PredictPage";

function App() {
  return (
    <div className="App min-h-screen">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/predict" element={<PredictPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-right" toastOptions={{ style: { background: "#0A1128", border: "1px solid #1e3a8a", color: "#fff" } }} />
      </BrowserRouter>
    </div>
  );
}

export default App;
