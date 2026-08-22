import axiosInstance from "@/src/libs/axios";
import { CompletionKind } from "@/src/modules/identities/model";

export class HabitService {
  static getAll = (_userId?: string) => {
    return axiosInstance.get("/habit").then((res) => res.data);
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

  /** Omitting `kind` keeps legacy FULL semantics; `{date}` alone toggles off. */
  static toggle = (
    id: string,
    date: string,
    value?: number,
    kind?: CompletionKind,
  ) => {
    return axiosInstance
      .post(`/habit/${id}/toggle`, { date, value, kind })
      .then((res) => res.data);
  };
}
