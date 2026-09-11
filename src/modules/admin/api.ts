import axiosInstance from "@/src/libs/axios";

export const AdminService = {
  getOverview: () =>
    axiosInstance.get("/analytics/admin/overview").then((res) => res.data),
  getDashboard: () =>
    axiosInstance.get("/analytics/admin/dashboard").then((res) => res.data),
  getUsers: () => axiosInstance.get("/admin/users").then((res) => res.data),
  getHabits: () => axiosInstance.get("/admin/habits").then((res) => res.data),
  getShopItems: () =>
    axiosInstance.get("/admin/shop/items").then((res) => res.data),
  getEconomyStats: () =>
    axiosInstance.get("/admin/economy/stats").then((res) => res.data),
  getAuditLogs: () =>
    axiosInstance.get("/admin/audit-logs").then((res) => res.data),
  getSystemConfig: () =>
    axiosInstance.get("/admin/system/config").then((res) => res.data),
};
