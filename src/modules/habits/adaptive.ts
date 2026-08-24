import axiosInstance from "@/src/libs/axios";

export type AdaptiveProposalType =
  | "REDUCE_TARGET"
  | "REDUCE_FREQUENCY"
  | "CHANGE_TIME";

export interface IAdaptiveSuggestion {
  id: string;
  type: AdaptiveProposalType;
  state: string;
  confidence: number;
  reason: string;
  sourceSignals: string[];
  evidence: Record<string, unknown>;
  fingerprint: string;
  current: { goal?: number; timesPerWeek?: number; scheduledTime?: string };
  proposed: { goal?: number; timesPerWeek?: number; scheduledTime?: string };
}

export interface IAdaptiveResponse {
  suggestion: IAdaptiveSuggestion | null;
  coach: { headline: string; message: string; actionLabel?: string } | null;
  ai: { provider: string; generated: boolean };
}

/** "5 km → 3 km" style summary of the deterministic proposal. */
export const describeProposal = (
  current: IAdaptiveSuggestion["current"],
  proposed: IAdaptiveSuggestion["proposed"],
  unit?: string | null,
): string => {
  if (proposed.goal !== undefined) return `${current.goal} ${unit ?? ""} → ${proposed.goal} ${unit ?? ""}`.replace(/\s+/g, " ").trim();
  if (proposed.timesPerWeek !== undefined) return `${current.timesPerWeek}×/week → ${proposed.timesPerWeek}×/week`;
  if (proposed.scheduledTime !== undefined) return `${current.scheduledTime} → ${proposed.scheduledTime}`;
  return "";
};

export interface IAdaptationOutcomeEntry {
  type: string;
  outcome: string;
  baselineCompletionRate: number | null;
  postCompletionRate: number | null;
}

export interface IAdaptationOutcomes {
  accepted: number;
  rejected: number;
  completedEvaluations: number;
  improved: number;
  unchanged: number;
  worsened: number;
  averageCompletionDelta: number | null;
  latestOutcome: string | null;
  recent?: IAdaptationOutcomeEntry[];
}

export class AdaptiveApiService {
  static getSuggestion = (habitId: string) => {
    return axiosInstance
      .get(`/habit/${habitId}/adaptive-suggestion`)
      .then((res) => res.data as IAdaptiveResponse);
  };

  static accept = (habitId: string, proposalId: string) => {
    return axiosInstance
      .post(`/habit/${habitId}/adaptive-suggestion/${proposalId}/accept`)
      .then((res) => res.data as IAdaptiveResponse);
  };

  static getOutcomes = (habitId: string) => {
    return axiosInstance
      .get(`/analytics/habits/${habitId}/adaptation-outcomes`)
      .then((res) => res.data as IAdaptationOutcomes);
  };

  static reject = (habitId: string, proposalId: string) => {
    return axiosInstance
      .post(`/habit/${habitId}/adaptive-suggestion/${proposalId}/reject`)
      .then((res) => res.data as IAdaptiveResponse);
  };
}
