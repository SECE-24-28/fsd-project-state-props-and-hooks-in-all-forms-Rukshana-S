import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("wearly_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("wearly_token");
      if (!window.location.pathname.includes("/login")) {
        alert("Session expired. Please login again.");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
