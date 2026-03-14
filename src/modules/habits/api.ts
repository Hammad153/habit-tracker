import axiosInstance from "@/src/libs/axios";

export class HabitService {
  static getAll = (userId: string) => {
    return axiosInstance.get(`/habit?userId=${userId}`).then((res) => res.data);
  };

  static getById = (id: string) => {
    return axiosInstance.get(`/habit/${id}`).then((res) => res.data);
  };

  static create = (data: any, userId: string) => {
    return axiosInstance
      .post("/habit", { ...data, userId })
      .then((res) => res.data);
  };

  static update = (id: string, data: any) => {
    return axiosInstance.patch(`/habit/${id}`, data).then((res) => res.data);
  };

  static delete = (id: string) => {
    return axiosInstance.delete(`/habit/${id}`).then((res) => res.data);
  };

  static toggle = (id: string, date: string, value?: number) => {
    return axiosInstance
      .post(`/habit/${id}/toggle`, { date, value })
      .then((res) => res.data);
  };
}
