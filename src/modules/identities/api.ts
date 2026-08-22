import axiosInstance from "@/src/libs/axios";
import { IIdentity } from "./model";

export class IdentityService {
  /**
   * `date` is an optional client-local `YYYY-MM-DD` key. It is only used to
   * compute "completed today"; the server never derives a day on its own.
   */
  static list = (date?: string): Promise<IIdentity[]> =>
    axiosInstance
      .get("/identity", { params: date ? { date } : undefined })
      .then((res) => res.data);

  static get = (id: string, date?: string): Promise<IIdentity> =>
    axiosInstance
      .get(`/identity/${id}`, { params: date ? { date } : undefined })
      .then((res) => res.data);

  static create = (data: Partial<IIdentity>): Promise<IIdentity> =>
    axiosInstance.post("/identity", data).then((res) => res.data);

  static update = (id: string, data: Partial<IIdentity>): Promise<IIdentity> =>
    axiosInstance.patch(`/identity/${id}`, data).then((res) => res.data);

  static remove = (id: string): Promise<{ archived?: boolean }> =>
    axiosInstance.delete(`/identity/${id}`).then((res) => res.data);

  static linkHabit = (
    identityId: string,
    habitId: string,
  ): Promise<unknown> =>
    axiosInstance
      .post(`/identity/${identityId}/habit`, { habitId })
      .then((res) => res.data);

  static unlinkHabit = (
    identityId: string,
    habitId: string,
  ): Promise<{ success?: boolean }> =>
    axiosInstance
      .delete(`/identity/${identityId}/habit/${habitId}`)
      .then((res) => res.data);
}
