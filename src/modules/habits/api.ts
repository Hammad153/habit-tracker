import axiosInstance from "@/src/libs/axios";
import { CompletionKind } from "@/src/modules/identities/model";
import type { HabitBurial } from './local-state';

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

  static setCompletion = (id: string, date: string, status: boolean, value: number, kind: CompletionKind) =>
    axiosInstance.put(`/habit/${id}/completions/${date}`, { status, value, kind }).then((res) => res.data);

  static bury = (id: string, commandId: string, burial: HabitBurial) =>
    axiosInstance.post(`/habit/${id}/bury`, {
      commandId, reason: burial.reason, epitaph: burial.epitaph, theme: burial.theme,
    }).then((res) => res.data);

  static getBurials = (cursor?: string): Promise<HabitBurial[]> =>
    axiosInstance.get('/habit/burials', { params: cursor ? { cursor } : undefined }).then((res) => res.data);

  static getBurial = (id: string): Promise<HabitBurial> =>
    axiosInstance.get(`/habit/burials/${id}`).then((res) => res.data);

  static restoreBurial = (id: string) =>
    axiosInstance.post(`/habit/burials/${id}/restore`).then((res) => res.data);

  static restartBurial = (id: string, newHabitId: string) =>
    axiosInstance.post(`/habit/burials/${id}/restart`, { newHabitId }).then((res) => res.data);

  static transition = (id: string, status: string) =>
    axiosInstance.post(`/habit/${id}/lifecycle`, { status }).then((res) => res.data);

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
