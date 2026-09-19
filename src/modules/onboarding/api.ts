import axiosInstance from "@/src/libs/axios";

export type OnboardingStep = { id: string; stepKey: string; order: number; kind: string; config: Record<string, any>; nextStepRule?: Record<string, any> | null };
export type OnboardingSession = { id: string; anonymousId: string; flowVersionId: string; currentStepKey: string | null; responses: Array<{ stepKey: string; value: unknown }>; steps: OnboardingStep[]; generatedPlan?: any };

export class OnboardingApiService {
  static getFlow = () => axiosInstance.get("/onboarding/flow", { __skipOfflineQueue: true } as any).then((res) => res.data);
  static startSession = (anonymousId: string) => axiosInstance.post("/onboarding/sessions", { anonymousId }, { __skipOfflineQueue: true } as any).then((res) => res.data as OnboardingSession);
  static recordStep = (sessionId: string, stepKey: string, value: unknown) => axiosInstance.post(`/onboarding/sessions/${encodeURIComponent(sessionId)}/steps`, { stepKey, value }, { __skipOfflineQueue: true } as any).then((res) => res.data);
  static generatePlan = (sessionId: string) => axiosInstance.post("/onboarding/sessions/plan", { sessionId }, { __skipOfflineQueue: true } as any).then((res) => res.data);
}
