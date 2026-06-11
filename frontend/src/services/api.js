import axios from "axios";

const api = axios.create({
   baseURL: "https://wearly-backend-tihq.onrender.com/api",
  withCredentials: true,
  timeout: 30000
});

api.interceptors.request.use(
  (config) => {
    // Support both 'token' and 'wearly_token' for full compatibility
    const token = localStorage.getItem("token") || localStorage.getItem("wearly_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network Error");
    }

    switch (error.response?.status) {
      case 400:
        console.error("Bad Request");
        break;

      case 401:
        console.error("Unauthorized");
        localStorage.removeItem("token");
        localStorage.removeItem("wearly_token");
        if (!window.location.pathname.includes("/login")) {
          alert("Session expired. Please login again.");
          window.location.href = "/login";
        }
        break;

      case 403:
        console.error("Forbidden");
        break;

      case 404:
        console.error("Resource Not Found");
        break;

      case 500:
        console.error("Internal Server Error");
        break;

      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default api;
