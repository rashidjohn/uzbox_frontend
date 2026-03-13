import axios, { AxiosInstance } from "axios";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
).replace(/\/$/, "");

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Har so'rovga access_token qo'shish ─────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Token muddati o'tganda — avtomatik yangilash ───────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) throw new Error("No refresh");
        const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh });
        localStorage.setItem("access_token", data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (typeof window !== "undefined") {
          // Qayerdan kelgan bo'lsa, login dan keyin o'sha yerga qaytarish
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?next=${next}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
