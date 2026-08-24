import axiosInstance from "@/src/libs/axios";

export interface IOverloadContributor {
  title: string;
  identityTitles: string[];
  contributionScore: number;
  missRate30: number | null;
  riskLevel: string | null;
  isIdentityAnchor: boolean;
  factor: string;
}

export interface IOverloadReport {
  overloaded: boolean;
  score: number;
  activeHabitCount: number;
  analyzedHabitCount: number;
  atRiskHabitCount: number;
  highRiskHabitCount: number;
  averageMissRate30: number | null;
  averageCompletionRate30: number | null;
  contributors: IOverloadContributor[];
  contributingFactors: string[];
  confidence: "LOW" | "MEDIUM" | "HIGH";
  insight: { headline: string; message: string; ctaLabel: string };
}

export class OverloadApiService {
  /** Deterministic portfolio report — no AI behind this endpoint. */
  static get = () => {
    return axiosInstance
      .get("/analytics/overload")
      .then((res) => res.data as IOverloadReport);
  };
}
