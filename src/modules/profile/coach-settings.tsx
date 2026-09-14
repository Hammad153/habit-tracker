import React, { useCallback, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { MessageSquare, Sparkles, FileText, Bell, Check } from "lucide-react-native";
import {
  ApContainer,
  ApErrorState,
  ApHeader,
  ApText,
  ApScrollView,
  SkeletonCard,
  SwitchButton,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { ToastService } from "@/src/services";
import {
  CoachPreferencesApiService,
  CoachFrequency,
  CoachTonePref,
  ICoachPreferences,
} from "./coach-preferences";

const TONES: Array<{ value: CoachTonePref; label: string; hint: string }> = [
  { value: "BALANCED", label: "Balanced", hint: "Warmth with practicality" },
  { value: "ENCOURAGING", label: "Encouraging", hint: "Supportive and warm" },
  { value: "DIRECT", label: "Direct", hint: "Straight to the point" },
  { value: "CALM", label: "Calm", hint: "Low-pressure, never urgent" },
  {
    value: "CHALLENGING",
    label: "Challenging",
    hint: "Respectfully pushes you",
  },
];

const FREQUENCIES: Array<{
  value: CoachFrequency;
  label: string;
  hint: string;
}> = [
  {
    value: "MINIMAL",
    label: "Minimal",
    hint: "Only recovery and critical moments",
  },
  {
    value: "STANDARD",
    label: "Standard",
    hint: "Important guidance, weekly review",
  },
  {
    value: "FREQUENT",
    label: "Frequent",
    hint: "Everything, including celebrations",
  },
];

const ToggleRow = ({
  icon: IconComponent,
  title,
  description,
  value,
  onChange,
  disabled,
  showBorderBottom = true,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  showBorderBottom?: boolean;
}) => {
  const colors = useTheme();
  return (
    <View
      className="flex-row items-center justify-between px-4 py-3.5"
      style={{
        borderBottomWidth: showBorderBottom ? 1 : 0,
        borderBottomColor: colors.surfaceBorder,
      }}
    >
      <View className="flex-row items-center flex-1 mr-3">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: colors.accentLight }}
        >
          <IconComponent size={18} color={colors.primary} />
        </View>
        <View className="flex-1 justify-center">
          <ApText size="sm" font="medium" color={colors.textPrimary}>
            {title}
          </ApText>
          <ApText size="xs" color={colors.textMuted} className="mt-0.5">
            {description}
          </ApText>
        </View>
      </View>
      <SwitchButton
        value={value}
        disabled={disabled}
        onValueChange={onChange}
      />
    </View>
  );
};

const OptionRow = ({
  label,
  hint,
  selected,
  onPress,
  showBorderBottom = true,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
  showBorderBottom?: boolean;
}) => {
  const colors = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className="flex-row items-center justify-between px-4 py-3.5"
      style={{
        backgroundColor: selected ? colors.accentLight : "transparent",
        borderBottomWidth: showBorderBottom ? 1 : 0,
        borderBottomColor: colors.surfaceBorder,
      }}
    >
      <View className="flex-1 justify-center">
        <ApText size="sm" font={selected ? "semibold" : "medium"} color={colors.textPrimary}>
          {label}
        </ApText>
        <ApText size="xs" color={colors.textMuted} className="mt-0.5">
          {hint}
        </ApText>
      </View>
      {selected && <Check size={16} color={colors.primary} strokeWidth={2.5} />}
    </Pressable>
  );
};

const CoachSettingsScreen = () => {
  const colors = useTheme();
  const [prefs, setPrefs] = useState<ICoachPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    CoachPreferencesApiService.get()
      .then(setPrefs)
      .catch((err) => {
        setError(true);
        ToastService.ApiError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const update = useCallback(
    (patch: Partial<ICoachPreferences>, key: string) => {
      if (!prefs || savingKey) return;
      setSavingKey(key);
      setPrefs({ ...prefs, ...patch });
      CoachPreferencesApiService.update(patch)
        .then((saved) => setPrefs(saved))
        .catch((err) => {
          ToastService.ApiError(err);
          setPrefs(prefs);
        })
        .finally(() => setSavingKey(null));
    },
    [prefs, savingKey],
  );

  if (!loading && (error || !prefs)) {
    return (
      <ApContainer>
        <ApHeader title="AI Coach" hasBackButton />
        <ApErrorState onRetry={() => setLoading(true)} />
      </ApContainer>
    );
  }

  return (
    <ApContainer>
      <ApHeader title="AI Coach" hasBackButton />
      {loading || !prefs ? (
        <ApScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <SkeletonCard style={{ height: 210, marginBottom: 20 }} />
          <SkeletonCard style={{ height: 180, marginBottom: 20 }} />
          <SkeletonCard style={{ height: 150 }} />
        </ApScrollView>
      ) : (
        <ApScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View
            className="rounded-2xl border overflow-hidden mb-5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <ToggleRow
              icon={MessageSquare}
              title="AI Coach"
              description="Personalized coaching on your habits"
              value={prefs.coachEnabled}
              onChange={(v) => update({ coachEnabled: v }, "coachEnabled")}
            />
            <ToggleRow
              icon={Sparkles}
              title="AI-generated wording"
              description="When off, coaching uses fixed text"
              value={prefs.aiCoachEnabled}
              onChange={(v) => update({ aiCoachEnabled: v }, "aiCoachEnabled")}
              disabled={!prefs.coachEnabled}
            />
            <ToggleRow
              icon={FileText}
              title="Weekly Review"
              description="A summary of your week, every week"
              value={prefs.weeklyReviewEnabled}
              onChange={(v) =>
                update({ weeklyReviewEnabled: v }, "weeklyReviewEnabled")
              }
            />
            <ToggleRow
              icon={Bell}
              title="Re-engagement nudges"
              description="Gentle, personalized prompts when a due habit is still incomplete"
              value={prefs.reengagementEnabled}
              onChange={(v) =>
                update({ reengagementEnabled: v }, "reengagementEnabled")
              }
              disabled={!prefs.coachEnabled}
              showBorderBottom={false}
            />
          </View>

          <ApText
            size="xs"
            font="semibold"
            color={colors.textMuted}
            className="uppercase mb-2 px-1"
            style={{ letterSpacing: 0.8 }}
          >
            Tone
          </ApText>
          <View
            className="rounded-2xl border overflow-hidden mb-5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            {TONES.map((t, index) => (
              <OptionRow
                key={t.value}
                label={t.label}
                hint={t.hint}
                selected={prefs.coachTone === t.value}
                showBorderBottom={index < TONES.length - 1}
                onPress={() =>
                  prefs.coachTone !== t.value &&
                  update({ coachTone: t.value }, `tone-${t.value}`)
                }
              />
            ))}
          </View>

          <ApText
            size="xs"
            font="semibold"
            color={colors.textMuted}
            className="uppercase mb-2 px-1"
            style={{ letterSpacing: 0.8 }}
          >
            Frequency
          </ApText>
          <View
            className="rounded-2xl border overflow-hidden mb-8"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            {FREQUENCIES.map((f, index) => (
              <OptionRow
                key={f.value}
                label={f.label}
                hint={f.hint}
                selected={prefs.coachFrequency === f.value}
                showBorderBottom={index < FREQUENCIES.length - 1}
                onPress={() =>
                  prefs.coachFrequency !== f.value &&
                  update({ coachFrequency: f.value }, `freq-${f.value}`)
                }
              />
            ))}
          </View>

          {savingKey && (
            <ApText size="xs" color={colors.textMuted} className="text-center mb-4">
              Saving…
            </ApText>
          )}
        </ApScrollView>
      )}
    </ApContainer>
  );
};

export default CoachSettingsScreen;
