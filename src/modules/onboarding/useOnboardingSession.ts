import { useCallback, useEffect, useState } from "react";
import { OnboardingApiService, OnboardingSession } from "./api";
import { ApStorageKeys, ApStorageService } from "@/src/services/storage";

const makeUuid = () => {
  const cryptoApi = (globalThis as any).crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : r & 3 | 8).toString(16);
  });
};

export function useOnboardingSession() {
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [loading, setLoading] = useState(true);

  const drainQueue = useCallback(async () => {
    const pending = await ApStorageService.getItemAsync(ApStorageKeys.OnboardingMutationQueue);
    const remaining: any[] = [];
    for (const item of Array.isArray(pending) ? pending : []) {
      try { await OnboardingApiService.recordStep(item.sessionId, item.stepKey, item.value); } catch { remaining.push(item); }
    }
    await ApStorageService.setItemAsync(ApStorageKeys.OnboardingMutationQueue, remaining);
  }, []);

  const start = useCallback(async () => {
    const storedAnonymousId = await ApStorageService.getRawItemAsync(ApStorageKeys.OnboardingAnonymousId);
    const anonymousId = storedAnonymousId || makeUuid();
    if (!storedAnonymousId) await ApStorageService.setItemAsync(ApStorageKeys.OnboardingAnonymousId, anonymousId);
    const cached = await ApStorageService.getItemAsync(ApStorageKeys.OnboardingSession);
    try {
      const current = await OnboardingApiService.startSession(anonymousId);
      setSession(current);
      await ApStorageService.setItemAsync(ApStorageKeys.OnboardingSession, current);
      await drainQueue();
      return current;
    } catch (error) {
      if (cached) setSession(cached);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [drainQueue]);

  useEffect(() => { void start(); }, [start]);

  const record = useCallback((stepKey: string, value: unknown) => {
    if (!session) return;
    void (async () => {
      const stored = await ApStorageService.getItemAsync(ApStorageKeys.OnboardingMutationQueue);
      const queue = [...(Array.isArray(stored) ? stored : []), { sessionId: session.id, stepKey, value }];
      await ApStorageService.setItemAsync(ApStorageKeys.OnboardingMutationQueue, queue.slice(-50));
      await drainQueue();
    })();
  }, [drainQueue, session]);

  return { session, loading, record, refresh: start };
}
