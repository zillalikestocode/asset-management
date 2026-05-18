import axios from "axios";
import type { ApiError } from "@/types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("af_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Queue of requests waiting for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      const refreshToken = localStorage.getItem("af_refresh");

      if (!refreshToken) {
        localStorage.removeItem("af_token");
        window.location.href = "/login";
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post("/api/v1/auth/refresh", {
          refreshToken,
        });
        localStorage.setItem("af_token", data.accessToken);
        localStorage.setItem("af_refresh", data.refreshToken);
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("af_token");
        localStorage.removeItem("af_refresh");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const apiError: ApiError = {
      message:
        err.response?.data?.message ??
        err.response?.error ??
        "Something went wrong",
      code: err.response?.data?.code,
      fields: err.response?.data?.fields,
    };
    return Promise.reject(apiError);
  },
);

// ── Typed helpers ──────────────────────────────────────────
export const get = <T>(url: string, params?: object) =>
  api.get<T>(url, { params }).then((r) => r.data);

export const post = <T>(url: string, data?: unknown) =>
  api.post<T>(url, data).then((r) => r.data);

export const put = <T>(url: string, data?: unknown) =>
  api.put<T>(url, data).then((r) => r.data);

export const patch = <T>(url: string, data?: unknown) =>
  api.patch<T>(url, data).then((r) => r.data);

export const del = <T>(url: string) => api.delete<T>(url).then((r) => r.data);
