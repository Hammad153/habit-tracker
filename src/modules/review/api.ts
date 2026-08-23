import axiosInstance from "@/src/libs/axios";

export interface IWeeklyReview {
  headline: string;
  summary: string;
  wins: string[];
  patterns: string[];
  identityReflection: string;
  nextWeekFocus: string[];
  tone?: string;
}

export interface IWeeklyReviewResponse {
  week: { start: string; end: string };
  inProgress: boolean;
  enabled?: boolean;
  review: IWeeklyReview | null;
  ai: { provider: string; generated: boolean; model?: string };
}

export class WeeklyReviewApiService {
  /**
   * Weekly behavioral review. `week` is an optional YYYY-MM-DD day inside
   * the target week (user-local); omitting it uses the user's current week.
   */
  static get = (week?: string) => {
    return axiosInstance
      .get("/analytics/weekly-review", { params: week ? { week } : undefined })
      .then((res) => res.data as IWeeklyReviewResponse);
  };

  /** Deliberate regeneration of a completed week (throttled server-side). */
  static regenerate = (week?: string) => {
    return axiosInstance
      .post("/analytics/weekly-review/regenerate", week ? { week } : {})
      .then((res) => res.data as IWeeklyReviewResponse);
  };
}
