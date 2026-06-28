import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});



api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const ignoredRoutes = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
    ];

    const shouldSkip = ignoredRoutes.some(route =>
      original.url?.includes(route)
    );
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !shouldSkip
    ) {
      original._retry = true;

      try {
        await api.post("/auth/refresh");
        return api(original);
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(err);
  }
);
