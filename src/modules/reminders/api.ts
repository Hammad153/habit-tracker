import axiosInstance from "@/src/libs/axios";

export class ReminderApiService {
  static getAll = (userId: string) => {
    return axiosInstance
      .get(`/reminder?userId=${userId}`)
      .then((res) => res.data);
  };

  static getByHabit = (habitId: string) => {
    return axiosInstance
      .get(`/reminder/habit/${habitId}`)
      .then((res) => res.data);
  };

  static create = (data: {
    userId: string;
    habitId: string;
    time: string;
    days: string[];
  }) => {
    return axiosInstance.post("/reminder", data).then((res) => res.data);
  };

  static update = (id: string, data: { time?: string; days?: string[]; enabled?: boolean }) => {
    return axiosInstance.patch(`/reminder/${id}`, data).then((res) => res.data);
  };

  static delete = (id: string) => {
    return axiosInstance.delete(`/reminder/${id}`).then((res) => res.data);
  };

  static registerPushToken = (userId: string, pushToken: string) => {
    return axiosInstance
      .post("/reminder/push-token", { userId, pushToken })
      .then((res) => res.data);
  };
}
