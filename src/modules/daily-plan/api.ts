import axiosInstance from "@/src/libs/axios";

const query = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const value = search.toString();
  return value ? `?${value}` : "";
};

export class DailyPlanService {
  static summary = (date?: string) =>
    axiosInstance.get(`/daily-plan/summary${query({ date })}`).then((res) => res.data);

  static plans = (params: { date?: string; startDate?: string; endDate?: string } = {}) =>
    axiosInstance.get(`/daily-plan${query(params)}`).then((res) => res.data);

  static createPlan = (data: any) =>
    axiosInstance.post("/daily-plan", data).then((res) => res.data);

  static updatePlan = (id: string, data: any) =>
    axiosInstance.patch(`/daily-plan/${id}`, data).then((res) => res.data);

  static deletePlan = (id: string) =>
    axiosInstance.delete(`/daily-plan/${id}`).then((res) => res.data);

  static createTask = (data: any) =>
    axiosInstance.post("/daily-plan/tasks", data).then((res) => res.data);

  static updateTask = (id: string, data: any) =>
    axiosInstance.patch(`/daily-plan/tasks/${id}`, data).then((res) => res.data);

  static deleteTask = (id: string) =>
    axiosInstance.delete(`/daily-plan/tasks/${id}`).then((res) => res.data);

  static reorderTasks = (taskIds: string[]) =>
    axiosInstance.patch("/daily-plan/tasks/reorder", { taskIds }).then((res) => res.data);
}
