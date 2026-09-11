import axiosInstance from "@/src/libs/axios";

export const AdminService = {
  getOverview: () =>
    axiosInstance.get("/analytics/admin/overview").then((res) => res.data),
  getDashboard: () =>
    axiosInstance.get("/analytics/admin/dashboard").then((res) => res.data),
  getUsers: (params?: Record<string, string | number | boolean | undefined>) =>
    axiosInstance.get("/admin/users", { params }).then((res) => res.data),
  getUser: (id: string) =>
    axiosInstance.get(`/admin/users/${id}`).then((res) => res.data),
  updateUserStatus: (id: string, isSuspended: boolean, reason?: string) =>
    axiosInstance
      .patch(`/admin/users/${id}/status`, { isSuspended, reason })
      .then((res) => res.data),
  getHabits: (params?: Record<string, string | number | boolean | undefined>) =>
    axiosInstance.get("/admin/habits", { params }).then((res) => res.data),
  getHabit: (id: string) =>
    axiosInstance.get(`/admin/habits/${id}`).then((res) => res.data),
  getShopItems: () =>
    axiosInstance.get("/admin/shop/items").then((res) => res.data),
  getEconomyStats: () =>
    axiosInstance.get("/admin/economy/stats").then((res) => res.data),
  getAuditLogs: (params?: Record<string, string | number | undefined>) =>
    axiosInstance.get("/admin/audit-logs", { params }).then((res) => res.data),
  getSystemConfig: () =>
    axiosInstance.get("/admin/system/config").then((res) => res.data),
};
