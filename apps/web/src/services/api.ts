import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("remitcare_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// NOTE: token storage here is illustrative. Production apps should weigh
// httpOnly-cookie storage or short-lived tokens + refresh rotation instead
// of localStorage to reduce XSS exposure.
