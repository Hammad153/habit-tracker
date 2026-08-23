import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ApContainer,
  ApErrorState,
  ApHeader,
  ApLoader,
  ApText,
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
  { value: "CHALLENGING", label: "Challenging", hint: "Respectfully pushes you" },
];

const FREQUENCIES: Array<{ value: CoachFrequency; label: string; hint: string }> = [
  { value: "MINIMAL", label: "Minimal", hint: "Only recovery and critical moments" },
  { value: "STANDARD", label: "Standard", hint: "Important guidance, weekly review" },
  { value: "FREQUENT", label: "Frequent", hint: "Everything, including celebrations" },
];

const ToggleRow = ({
  icon,
  title,
  description,
  value,
  onChange,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) => {
  const colors = useTheme();
  return (
    <View
      className="flex-row items-center justify-between p-4 border-b"
      style={{ borderBottomColor: colors.surfaceBorder }}
    >
      <View className="flex-row items-center flex-1 mr-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: colors.background }}
        >
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View className="flex-1">
          <ApText size="base" font="semibold" color={colors.textPrimary}>
            {title}
          </ApText>
          <ApText size="xs" color={colors.textMuted} className="mt-0.5">
            {description}
          </ApText>
        </View>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceInactive, true: colors.primary + "80" }}
        thumbColor={value ? colors.primary : colors.textMuted}
      />
    </View>
  );
};

const OptionRow = ({
  label,
  hint,
  selected,
  onPress,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
}) => {
  const colors = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`flex-row items-center justify-between p-4 ${selected ? "" : ""}`}
      style={{
        backgroundColor: selected ? colors.primary + "14" : "transparent",
        borderRadius: selected ? 12 : 0,
      }}
    >
      <View className="flex-1">
        <ApText size="base" font={selected ? "bold" : "normal"} color={colors.textPrimary}>
          {label}
        </ApText>
        <ApText size="xs" color={colors.textMuted} className="mt-0.5">
          {hint}
        </ApText>
      </View>
      {selected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
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
      // Optimistic UI; server is the source of truth.
      setPrefs({ ...prefs, ...patch });
      CoachPreferencesApiService.update(patch)
        .then((saved) => setPrefs(saved))
        .catch((err) => {
          ToastService.ApiError(err);
          setPrefs(prefs); // revert on failure
        })
        .finally(() => setSavingKey(null));
    },
    [prefs, savingKey],
  );

  if (loading) return <ApLoader />;

  if (error || !prefs) {
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
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surface }}>
          <ToggleRow
            icon="chatbubbles-outline"
            title="AI Coach"
            description="Personalized coaching on your habits"
            value={prefs.coachEnabled}
            onChange={(v) => update({ coachEnabled: v }, "coachEnabled")}
          />
          <ToggleRow
            icon="sparkles-outline"
            title="AI-generated wording"
            description="When off, coaching uses fixed text"
            value={prefs.aiCoachEnabled}
            onChange={(v) => update({ aiCoachEnabled: v }, "aiCoachEnabled")}
            disabled={!prefs.coachEnabled}
          />
          <ToggleRow
            icon="document-text-outline"
            title="Weekly Review"
            description="A summary of your week, every week"
            value={prefs.weeklyReviewEnabled}
            onChange={(v) => update({ weeklyReviewEnabled: v }, "weeklyReviewEnabled")}
          />
        </View>

        <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase mb-2" style={{ letterSpacing: 1 }}>
          Tone
        </ApText>
        <View className="rounded-2xl overflow-hidden mb-5" style={{ backgroundColor: colors.surface }}>
          {TONES.map((t) => (
            <OptionRow
              key={t.value}
              label={t.label}
              hint={t.hint}
              selected={prefs.coachTone === t.value}
              onPress={() =>
                prefs.coachTone !== t.value &&
                update({ coachTone: t.value }, `tone-${t.value}`)
              }
            />
          ))}
        </View>

        <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase mb-2" style={{ letterSpacing: 1 }}>
          Frequency
        </ApText>
        <View className="rounded-2xl overflow-hidden mb-8" style={{ backgroundColor: colors.surface }}>
          {FREQUENCIES.map((f) => (
            <OptionRow
              key={f.value}
              label={f.label}
              hint={f.hint}
              selected={prefs.coachFrequency === f.value}
              onPress={() =>
                prefs.coachFrequency !== f.value &&
                update({ coachFrequency: f.value }, `freq-${f.value}`)
              }
            />
          ))}
        </View>

        {savingKey && (
          <ApText size="xs" color={colors.textMuted} className="text-center">
            Saving…
          </ApText>
        )}
      </ScrollView>
    </ApContainer>
  );
};

export default CoachSettingsScreen;
