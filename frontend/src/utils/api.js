// src/utils/api.js — Axios instance with interceptors

import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 and token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/refresh-token`,
            { refreshToken },
          );
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return API(original);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

// ── Auth ───────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  logout: () => API.post("/auth/logout"),
  getMe: () => API.get("/auth/me"),
  changePassword: (data) => API.put("/auth/change-password", data),
};

// ── Flights ────────────────────────────────────────────────
export const flightAPI = {
  search: (params) => API.get("/flights/search", { params }),
  getById: (id) => API.get(`/flights/${id}`),
  getPopularRoutes: () => API.get("/flights/popular-routes"),
};

// ── Hotels ────────────────────────────────────────────────
export const hotelAPI = {
  search: (params) => API.get("/hotels/search", { params }),
  getById: (id) => API.get(`/hotels/${id}`),
  getFeatured: () => API.get("/hotels/featured"),
  addReview: (id, data) => API.post(`/hotels/${id}/reviews`, data),
};

// ── Bookings ───────────────────────────────────────────────
export const bookingAPI = {
  create: (data) => API.post("/bookings", data),
  getMyBookings: (params) => API.get("/bookings/my-bookings", { params }), //
  getById: (id) => API.get(`/bookings/${id}`),
  getByReference: (ref) => API.get(`/bookings/reference/${ref}`),
  cancel: (id, reason) => API.put(`/bookings/${id}/cancel`, { reason }),
};

// ── Payments ───────────────────────────────────────────────
export const paymentAPI = {
  process: (data) => API.post("/payments/process", data),
  getStatus: (bookingId) => API.get(`/payments/status/${bookingId}`),
  refund: (bookingId) => API.post(`/payments/refund/${bookingId}`),
};

// ── Users ──────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => API.get("/users/profile"),
  updateProfile: (data) => API.put("/users/profile", data),
  toggleSavedFlight: (id) => API.post(`/users/saved-flights/${id}`),
  toggleSavedHotel: (id) => API.post(`/users/saved-hotels/${id}`),
};

export default API;
