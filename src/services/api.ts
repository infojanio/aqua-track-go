import axios from "axios";

// Base axios instance — ready for future backend integration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 15000,
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // central error handler — extend later (toast, logging)
    return Promise.reject(err);
  },
);
