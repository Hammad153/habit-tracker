import React, { useEffect, useMemo, useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { OnboardingApiService, OnboardingStep } from "./api";
import { useOnboardingSession } from "./useOnboardingSession";
import { OnboardingStepRenderer } from "./stepRegistry";
import { useTheme } from "../settings/context";

export default function OnboardingEngine() {
  const router = useRouter();
  const { colors } = useTheme();
  const { session, loading, record } = useOnboardingSession();
  const [key, setKey] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [value, setValue] = useState<unknown>();
  const step = useMemo(() => session?.steps.find((item) => item.stepKey === key) || session?.steps[0], [session, key]);

  useEffect(() => { if (session && !key) { setKey(session.currentStepKey || session.steps[0]?.stepKey); const restored: Record<string, unknown> = {}; session.responses.forEach((item) => { restored[item.stepKey] = item.value; }); setAnswers(restored); } }, [session, key]);
  useEffect(() => { if (step) { setValue(answers[step.stepKey]); } }, [step?.stepKey]);
  useEffect(() => {
    if (step?.kind === "REVEAL" && session && !session.generatedPlan) {
      void OnboardingApiService.generatePlan(session.id).then((generatedPlan) => {
        setAnswers((current) => ({ ...current, generatedPlan }));
      }).catch(() => undefined);
    }
  }, [step?.stepKey, session?.id, session?.generatedPlan]);

  const nextKey = (current: OnboardingStep, action?: string) => {
    const rule = current.nextStepRule || {};
    const actionTarget = action && rule.onAction?.[action];
    if (actionTarget) return actionTarget;
    if (rule.default) return rule.default;
    return session?.steps.find((candidate) => candidate.order === current.order + 1)?.stepKey || "END";
  };
  const complete = (action?: string) => {
    if (!step || !session) return;
    if (step.kind === "AUTH") { record(step.stepKey, value); router.push("/login"); return; }
    const nextAnswers = { ...answers, [step.stepKey]: value };
    setAnswers(nextAnswers); record(step.stepKey, value);
    const target = nextKey(step, action);
    if (target === "END") { router.replace("/(tabs)"); return; }
    setHistory((current) => [...current, step.stepKey]); setKey(target);
  };
  useEffect(() => {
    if (!step || !["SPLASH", "LOADING"].includes(step.kind)) return;
    const timer = setTimeout(() => complete(), step.kind === "LOADING" ? 1600 : 900);
    return () => clearTimeout(timer);
  }, [step?.stepKey]);
  if (loading || !step) return <SafeAreaView className="flex-1 bg-background" />;
  const index = session?.steps.findIndex((item) => item.stepKey === step.stepKey) ?? 0;
  return <SafeAreaView className="flex-1 bg-background"><View className="flex-1 px-5 pt-4"><View className="flex-row items-center justify-between"><Pressable disabled={!history.length} onPress={() => { const previous = history[history.length - 1]; setHistory((current) => current.slice(0, -1)); setKey(previous); }} className="h-10 w-10 items-center justify-center">{history.length ? <ArrowLeft color={colors.inkPrimary} size={22} /> : null}</Pressable><Text className="text-caption text-ink-tertiary">{index + 1}/{session?.steps.length}</Text><View className="w-10" /></View><View className="mt-2 h-1 overflow-hidden rounded-pill bg-background-surface2"><View className="h-full rounded-pill bg-accent" style={{ width: `${((index + 1) / (session?.steps.length || 1)) * 100}%` }} /></View><View className="flex-1 py-8"><OnboardingStepRenderer step={step} value={value} onChange={setValue} onAction={(action) => complete(action)} /></View>{!["SPLASH", "LOADING", "PERMISSION", "COMMIT", "PAYWALL", "DISCOUNT"].includes(step.kind) && <Pressable onPress={() => complete()} className="mb-4 rounded-pill bg-accent px-5 py-4"><Text className="text-center text-body font-semibold text-ink-inverse">{step.kind === "AUTH" ? "Sign in to save" : "Continue"}</Text></Pressable>}</View></SafeAreaView>;
}
