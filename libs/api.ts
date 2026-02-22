import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const habitApi = {
  getAll: (userId: string = "default-user") =>
    api.get(`/habit?userId=${userId}`),
  getById: (id: string) => api.get(`/habit/${id}`),
  create: (data: any) =>
    api.post("/habit", { ...data, userId: "default-user" }),
  update: (id: string, data: any) => api.patch(`/habit/${id}`, data),
  delete: (id: string) => api.delete(`/habit/${id}`),
  toggle: (id: string, date: string, value?: number) =>
    api.post(`/habit/${id}/toggle`, { date, value }),
};

export const profileApi = {
  get: (userId: string = "default-user") =>
    api.get(`/profile?userId=${userId}`),
  update: (id: string, data: any) => api.patch(`/profile/${id}`, data),
};

export const awardsApi = {
  getAll: () => api.get("/awards"),
  getUserBadges: (userId: string = "default-user") =>
    api.get(`/awards/user?userId=${userId}`),
};

export const timelineApi = {
  get: (userId: string = "default-user") =>
    api.get(`/timeline?userId=${userId}`),
};

export default api;
