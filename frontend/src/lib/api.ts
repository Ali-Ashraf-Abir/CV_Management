import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearAccessToken, getAccessToken } from "./token";
import { refreshAccessToken } from "./auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;
async function getFreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    if (!original) return Promise.reject(error);

    const ignored = ["/auth/login", "/auth/register", "/auth/refresh"];
    const shouldSkip = ignored.some((route) => original.url?.includes(route));
    const status = error.response?.status;

    if (status !== 401 || original._retry || shouldSkip) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const token = await getFreshAccessToken();
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch {
      clearAccessToken();
      return Promise.reject(error);
    }
  }
);

// Normalizes backend ProblemDetails / exception payloads into a readable message
export function extractErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; title?: string; detail?: string } | undefined;
    return data?.message ?? data?.detail ?? data?.title ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
