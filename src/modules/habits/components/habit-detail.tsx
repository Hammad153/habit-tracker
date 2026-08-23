import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ApText,
  ApContainer,
  ApHeader,
  ApLoader,
  ApErrorState,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { ToastService } from "@/src/services";
import { getScheduleLabel, getCurrentStreak } from "@/src/utils/schedule";
import { HabitService } from "@/src/modules/habits/api";
import { ReminderApiService } from "@/src/modules/reminders/api";
import { IReminder } from "@/src/modules/reminders/model";
import { IHabit } from "@/src/modules/habits/model";
import { useRewardsState } from "@/src/modules/rewards/context";
import { RewardsService } from "@/src/modules/rewards/api";
import { BundleStatus, IRewardBreakdownLine, ITemptationBundle } from "@/src/modules/rewards/model";
import {
  CoachApiService,
  ICoach,
  InterventionApiService,
  IIntervention,
  InterventionActionType,
} from "@/src/modules/habits/intervention";
import InsightCard from "./InsightCard";
import { router } from "expo-router";
import HabitTimer from "./HabitTimer";
import { isSameDateKey, toDateKey } from "@/src/utils/date";

interface HabitDetailScreenProps {
  habitId: string;
}

const todayStr = () => toDateKey(new Date());

const StatTile = ({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) => {
  const colors = useTheme();
  return (
    <View
      className="flex-1 rounded-2xl p-4 items-center"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder }}
    >
      <Ionicons name={icon} size={20} color={color} />
      <ApText size="xl" font="bold" color={colors.textPrimary} className="mt-2">
        {value}
      </ApText>
      <ApText size="xs" color={colors.textMuted} className="mt-1">
        {label}
      </ApText>
    </View>
  );
};

const HabitDetailScreen: React.FC<HabitDetailScreenProps> = ({ habitId }) => {
  const colors = useTheme();
  const { toggleHabit } = useHabitState();

  const { freezeDay } = useRewardsState();
  const [habit, setHabit] = useState<IHabit | null>(null);
  const [reminder, setReminder] = useState<IReminder | null>(null);
  const [bundles, setBundles] = useState<ITemptationBundle[]>([]);
  const [freezingDate, setFreezingDate] = useState<string | null>(null);
  const [usingBundleId, setUsingBundleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [insight, setInsight] = useState<IIntervention | null>(null);
  const [coach, setCoach] = useState<ICoach | null>(null);
  const [dismissedFingerprints, setDismissedFingerprints] = useState<string[]>([]);
  const [insightBusy, setInsightBusy] = useState(false);

  const load = useCallback(() => {
    setError(false);
    return HabitService.getById(habitId)
      .then((data) => {
        setHabit(data);
        // Reminder is best-effort; a habit without one is perfectly valid.
        return ReminderApiService.getByHabit(habitId).catch(() => null);
      })
      .then((rem) => {
        setReminder(rem && rem.id ? rem : null);
        // Bundles are best-effort; a habit without them is valid.
        return RewardsService.listBundles(habitId).catch(() => []);
      })
      .then((bnd) => {
        setBundles(Array.isArray(bnd) ? bnd : []);
        // Insight is best-effort and must never block the screen.
        return InterventionApiService.getForHabit(habitId).catch(() => null);
      })
      .then((res) => {
        setInsight(res?.intervention ?? null);
        setCoach(null);
        // AI enhancement is independent and must never block or fail loudly:
        // deterministic card stays if the coach layer is unavailable.
        return res?.intervention
          ? CoachApiService.getForHabit(habitId)
              .then((c) => setCoach(c.coach))
              .catch(() => setCoach(null))
          : null;
      })
      .catch((err) => {
        setError(true);
        ToastService.ApiError(err);
      })
      .finally(() => setLoading(false));
  }, [habitId]);

  useEffect(() => {
    load();
  }, [load]);

  const accent = habit?.iconColor || colors.primary;

  const completions = useMemo(() => habit?.completions ?? [], [habit]);
  const streak = useMemo(
    () => getCurrentStreak(completions, habit ?? undefined),
    [completions, habit],
  );
  const totalDone = useMemo(
    () => completions.filter((c) => c.status).length,
    [completions],
  );
  const history = useMemo(
    () => [...completions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 10),
    [completions],
  );

  const today = todayStr();
  const todayCompletion = completions.find((c) =>
    isSameDateKey(c.date, today),
  );
  const isCompletedToday = !!todayCompletion?.status;

  const handleMarkComplete = useCallback(() => {
    if (!habit) return;
    // Reuse the existing toggle flow so completion logic stays in one place.
    if (!isCompletedToday) {
      toggleHabit(habit.id, today)
        .then((rewards) => {
          if (rewards && typeof rewards.coinsAwarded === "number") {
            const milestones = (rewards.newStreakMilestones ?? []) as number[];
            const extras = milestones.length
              ? ` incl. ${milestones.join("-")}-day streak bonus${milestones.length > 1 ? "es" : ""}`
              : "";
            ToastService.Success(
              `+${rewards.coinsAwarded} coins earned${extras}!`,
            );
          }
          load();
        });
    }
  }, [habit, isCompletedToday, load, toggleHabit, today]);

  const handleInsightAction = useCallback(
    (action: InterventionActionType) => {
      if (!habit || !insight) return;
      if (action === "USE_MINIMUM_VERSION" || action === "USE_EMERGENCY_VERSION") {
        // Reuse the existing completion flow with the recommended kind.
        const kind =
          action === "USE_MINIMUM_VERSION" ? "MINIMUM" : "EMERGENCY";
        setInsightBusy(true);
        toggleHabit(habit.id, today, habit.goal ?? undefined, kind)
          .then((rewards) => {
            ToastService.Success(
              rewards && typeof rewards.coinsAwarded === "number"
                ? `+${rewards.coinsAwarded} coins earned!`
                : "Completed — nice work!",
            );
            setInsight(null);
            load();
          })
          .catch((err) => ToastService.ApiError(err))
          .finally(() => setInsightBusy(false));
        return;
      }
      if (action === "OPEN_HABIT_EDIT" || action === "CONFIGURE_HABIT_STACK") {
        router.push(`/edit-habit?habitId=${habit.id}`);
        return;
      }
      if (action === "REVIEW_ACTIVE_HABITS") {
        router.push("/manage-habits");
      }
    },
    [habit, insight, toggleHabit, today, load],
  );

  const handleDismissInsight = useCallback(() => {
    setInsight((current) => {
      if (current?.fingerprint) {
        setDismissedFingerprints((prev) =>
          prev.includes(current.fingerprint) ? prev : [...prev, current.fingerprint],
        );
      }
      return null;
    });
  }, []);

  const handleFreeze = useCallback(
    (date: string) => {
      if (!habit || freezingDate) return;
      setFreezingDate(date);
      freezeDay(habit.id, date).finally(() => {
        setFreezingDate(null);
        load();
      });
    },
    [habit, freezingDate, freezeDay, load],
  );

  const handleUseBundle = useCallback(
    (bundle: ITemptationBundle) => {
      if (usingBundleId) return;
      setUsingBundleId(bundle.id);
      RewardsService.consumeBundle(bundle.id)
        .then(() => ToastService.Success(`"${bundle.title}" enjoyed!`))
        .catch((err) => ToastService.ApiError(err))
        .finally(() => {
          setUsingBundleId(null);
          load();
        });
    },
    [usingBundleId, load],
  );

  if (loading) return <ApLoader />;

  if (error || !habit) {
    return (
      <ApContainer>
        <ApHeader title="Habit" hasBackButton />
        <ApErrorState onRetry={() => { setLoading(true); load(); }} />
      </ApContainer>
    );
  }

  const description = habit.subtitle;

  return (
    <ApContainer>
      <ApHeader title="Habit Breakdown" hasBackButton />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View className="px-5 mt-4">
          <LinearGradient
            colors={[accent + "33", colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6 rounded-3xl border"
            style={{ borderColor: colors.surfaceBorder }}
          >
            <View className="flex-row items-center">
              <View
                className="w-16 h-16 rounded-2xl items-center justify-center"
                style={{ backgroundColor: (habit.iconBg || accent + "20") as string }}
              >
                <Ionicons name={(habit.icon as any) || "ellipse"} size={32} color={accent} />
              </View>
              <View className="ml-4 flex-1">
                <ApText size="2xl" font="bold" color={colors.textPrimary} numberOfLines={2}>
                  {habit.title}
                </ApText>
                {isCompletedToday && (
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <ApText size="xs" font="semibold" color={colors.success} className="ml-1">
                      Completed today
                    </ApText>
                  </View>
                )}
              </View>
            </View>

            {description ? (
              <ApText size="sm" color={colors.textSecondary} className="mt-4">
                {description}
              </ApText>
            ) : null}

            {habit.category ? (
              <View className="flex-row mt-4">
                <View
                  className="flex-row items-center px-3 py-1 rounded-full"
                  style={{ backgroundColor: colors.background }}
                >
                  <Ionicons name="pricetag" size={12} color={accent} />
                  <ApText size="xs" font="semibold" color={colors.textSecondary} className="ml-1">
                    {habit.category}
                  </ApText>
                </View>
              </View>
            ) : null}
          </LinearGradient>
        </View>

        {/* Stats */}
        <View className="px-5 mt-5 flex-row gap-3">
          <StatTile icon="flame" label="Day streak" value={`${streak}`} color={colors.warning} />
          <StatTile icon="checkmark-done" label="Completed" value={`${totalDone}`} color={colors.success} />
          <StatTile
            icon="trophy"
            label="Goal"
            value={`${habit.goal || 1}${habit.unit ? "" : "x"}`}
            color={accent}
          />
        </View>

        {/* Habit insight (deterministic intervention) */}
        {insight &&
        !dismissedFingerprints.includes(insight.fingerprint) &&
        !(insight.category === "USER_ACTION_REQUIRED" && isCompletedToday) ? (
          <View className="px-5 mt-5">
            <InsightCard
              intervention={insight}
              coach={coach}
              busy={insightBusy}
              onAction={handleInsightAction}
              onDismiss={handleDismissInsight}
            />
          </View>
        ) : null}

        {/* Schedule */}
        <View className="px-5 mt-6">
          <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 uppercase" style={{ letterSpacing: 1 }}>
            Schedule
          </ApText>
          <View
            className="flex-row items-center rounded-2xl p-4"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder }}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: accent + "20" }}>
              <Ionicons name="calendar" size={18} color={accent} />
            </View>
            <View className="ml-3 flex-1">
              <ApText size="base" font="semibold" color={colors.textPrimary}>
                {getScheduleLabel(habit)}
              </ApText>
              {habit.unit ? (
                <ApText size="xs" color={colors.textMuted} className="mt-0.5">
                  Target: {habit.goal} {habit.unit}
                </ApText>
              ) : null}
            </View>
          </View>
        </View>

        {/* Reminder */}
        <View className="px-5 mt-6">
          <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 uppercase" style={{ letterSpacing: 1 }}>
            Reminder
          </ApText>
          <View
            className="flex-row items-center rounded-2xl p-4"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder }}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: accent + "20" }}>
              <Ionicons name={reminder?.enabled ? "notifications" : "notifications-off"} size={18} color={accent} />
            </View>
            <View className="ml-3 flex-1">
              {reminder?.enabled ? (
                <>
                  <ApText size="base" font="semibold" color={colors.textPrimary}>
                    {reminder.time}
                  </ApText>
                  <ApText size="xs" color={colors.textMuted} className="mt-0.5">
                    {reminder.days?.join(", ") || "Every day"}
                  </ApText>
                </>
              ) : (
                <ApText size="sm" color={colors.textMuted}>
                  No reminder set
                </ApText>
              )}
            </View>
          </View>
        </View>

        {/* Temptation bundles */}
        {bundles.length > 0 && (
          <View className="px-5 mt-6">
            <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 uppercase" style={{ letterSpacing: 1 }}>
              Reward Bundles
            </ApText>
            {bundles.map((bundle) => {
              const unlocked = bundle.status === BundleStatus.UNLOCKED;
              const used = bundle.status === BundleStatus.USED;
              return (
                <View
                  key={bundle.id}
                  className="flex-row items-center rounded-2xl p-4 mb-3"
                  style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder }}
                >
                  <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: accent + "20" }}>
                    <Ionicons
                      name={used ? "checkmark-done" : unlocked ? "gift" : "lock-closed"}
                      size={18}
                      color={unlocked ? accent : colors.textMuted}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <ApText size="base" font="semibold" color={colors.textPrimary}>
                      {bundle.title}
                    </ApText>
                    <ApText size="xs" color={colors.textMuted} className="mt-0.5">
                      {used ? "Enjoyed" : unlocked ? "Unlocked — treat yourself" : "Locked · complete this habit fully to unlock"}
                    </ApText>
                  </View>
                  {unlocked && (
                    <Pressable
                      onPress={() => handleUseBundle(bundle)}
                      disabled={usingBundleId !== null}
                      accessibilityRole="button"
                      accessibilityLabel={`Use reward bundle ${bundle.title}`}
                      className="px-4 h-9 rounded-full items-center justify-center"
                      style={{ backgroundColor: accent }}
                    >
                      <ApText size="xs" font="bold" color={colors.background}>
                        Use
                      </ApText>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Completion history */}
        <View className="px-5 mt-6">
          <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 uppercase" style={{ letterSpacing: 1 }}>
            Recent History
          </ApText>
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder }}
          >
            {history.length === 0 ? (
              <View className="p-5 items-center">
                <Ionicons name="time-outline" size={22} color={colors.textMuted} />
                <ApText size="sm" color={colors.textMuted} className="mt-2">
                  No history yet — start today!
                </ApText>
              </View>
            ) : (
              history.map((c, index) => (
                <View
                  key={c.id || c.date}
                  className={`flex-row items-center justify-between px-4 py-3 ${
                    index !== history.length - 1 ? "border-b" : ""
                  }`}
                  style={{ borderBottomColor: colors.surfaceBorder }}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name={c.status ? "checkmark-circle" : "close-circle"}
                      size={18}
                      color={c.status ? colors.success : colors.textMuted}
                    />
                    <ApText size="sm" color={colors.textPrimary} className="ml-3">
                      {c.date}
                    </ApText>
                  </View>
                  <View className="flex-row items-center">
                    {habit.unit ? (
                      <ApText size="xs" color={colors.textMuted}>
                        {c.value ?? 0} {habit.unit}
                      </ApText>
                    ) : (
                      <ApText size="xs" font="semibold" color={c.status ? colors.success : colors.textMuted}>
                        {c.status ? "Done" : "Missed"}
                      </ApText>
                    )}
                    {!c.status && (
                      <Pressable
                        onPress={() => handleFreeze(c.date)}
                        disabled={freezingDate !== null}
                        accessibilityRole="button"
                        accessibilityLabel={`Protect ${c.date} with a streak freeze`}
                        hitSlop={8}
                        className="ml-2"
                      >
                        <Ionicons
                          name="snow"
                          size={16}
                          color={freezingDate === c.date ? accent : colors.primary}
                        />
                      </Pressable>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Start Habit CTA */}
      <View
        className="absolute left-0 right-0 bottom-0 px-5 pt-3 pb-6"
        style={{ backgroundColor: colors.background, borderTopWidth: 1, borderColor: colors.surfaceBorder }}
      >
        <Pressable
          onPress={() => setShowTimer(true)}
          accessibilityRole="button"
          accessibilityLabel="Start habit session"
          className="h-14 rounded-full items-center justify-center flex-row"
          style={{ backgroundColor: accent }}
        >
          <Ionicons name="play-circle" size={24} color={colors.background} />
          <ApText size="base" font="bold" color={colors.background} className="ml-2">
            Start Habit
          </ApText>
        </Pressable>
      </View>

      <HabitTimer
        visible={showTimer}
        habitTitle={habit.title}
        color={accent}
        onClose={() => setShowTimer(false)}
        onComplete={isCompletedToday ? undefined : handleMarkComplete}
      />
    </ApContainer>
  );
};

export default HabitDetailScreen;
