import axiosInstance from "@/src/libs/axios";

export type NotificationType =
  | "HABIT_AT_RISK"
  | "RECOVERY_NEEDED"
  | "DIFFICULTY_TOO_HIGH"
  | "WEEKDAY_RISK"
  | "TIME_RISK"
  | "MOMENTUM_PROTECTION"
  | "OVERLOAD_DETECTED"
  | "ADAPTIVE_PROPOSAL_AVAILABLE"
  | "ADAPTATION_OUTCOME"
  | "WEEKLY_REVIEW_READY"
  | "IDENTITY_REINFORCEMENT";

export interface INotificationCandidate {
  type: NotificationType;
  priority: "URGENT" | "HIGH" | "NORMAL" | "LOW";
  fingerprint: string;
  title: string;
  body: string;
  action: { route: string };
  expiresAt: string;
}

export class BehavioralNotificationApiService {
  /**
   * Deterministic candidates from the backend (analytics -> decision ->
   * cadence). The client schedules them as LOCAL notifications.
   */
  static getCandidates = () => {
    return axiosInstance
      .get("/notifications/candidates")
      .then((res) => res.data as INotificationCandidate[]);
  };

  /** Idempotent delivery confirmation (unique userId+fingerprint server-side). */
  static markDelivered = (
    items: Array<
      Pick<INotificationCandidate, "fingerprint" | "type" | "priority">
    >,
  ) => {
    return axiosInstance
      .post("/notifications/delivered", { items })
      .then((res) => res.data as { stored: number });
  };
}
