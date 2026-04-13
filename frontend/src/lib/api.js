import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
});

export const submitPrediction = async (payload) => {
  const response = await api.post("/predict", payload);
  return response.data;
};

export const fetchDashboard = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

export const fetchHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

export default api;