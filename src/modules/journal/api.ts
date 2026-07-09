import axiosInstance from "@/src/libs/axios";
import { IJournalEntry } from "./model";

export class JournalService {
  static entries = (): Promise<IJournalEntry[]> =>
    axiosInstance.get("/journal").then((res) => res.data);

  static createEntry = (data: any): Promise<IJournalEntry> =>
    axiosInstance.post("/journal", data).then((res) => res.data);

  static updateEntry = (id: string, data: any): Promise<IJournalEntry> =>
    axiosInstance.patch(`/journal/${id}`, data).then((res) => res.data);

  static deleteEntry = (id: string) =>
    axiosInstance.delete(`/journal/${id}`).then((res) => res.data);

  /** Flipped server-side, so the client never sends a stale boolean. */
  static toggleFavorite = (id: string): Promise<IJournalEntry> =>
    axiosInstance.patch(`/journal/${id}/favorite`).then((res) => res.data);

  static togglePinned = (id: string): Promise<IJournalEntry> =>
    axiosInstance.patch(`/journal/${id}/pin`).then((res) => res.data);
}
