import axiosInstance from "@/src/libs/axios";

export type CoachTonePref =
  | "ENCOURAGING"
  | "DIRECT"
  | "CALM"
  | "CHALLENGING"
  | "BALANCED";

export type CoachFrequency = "MINIMAL" | "STANDARD" | "FREQUENT";

export interface ICoachPreferences {
  coachEnabled: boolean;
  aiCoachEnabled: boolean;
  coachTone: CoachTonePref;
  coachFrequency: CoachFrequency;
  weeklyReviewEnabled: boolean;
}

export class CoachPreferencesApiService {
  static get = () => {
    return axiosInstance
      .get("/profile/coach-preferences")
      .then((res) => res.data as ICoachPreferences);
  };

  static update = (prefs: Partial<ICoachPreferences>) => {
    return axiosInstance
      .patch("/profile/coach-preferences", prefs)
      .then((res) => res.data as ICoachPreferences);
  };
}
