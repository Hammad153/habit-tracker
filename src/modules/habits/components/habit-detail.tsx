import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { ArrowLeft, MoreHorizontal, Calendar, Bell, Clock, Sparkles, Check } from "lucide-react-native";
import { router } from "expo-router";
import {
  ApErrorState,
  Skeleton,
  SkeletonCard,
} from "@/src/components";
import { Card } from "@/src/components/Card";
import { Button } from "@/src/components/buttons/Button";
import { ListRow } from "@/src/components/ListRow";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import LogValueModal from "./LogValueModal";
import { ToastService } from "@/src/services";
import { getScheduleLabel, getCurrentStreak } from "@/src/utils/schedule";
import { HabitService } from "@/src/modules/habits/api";
import { ReminderApiService } from "@/src/modules/reminders/api";
import { IReminder } from "@/src/modules/reminders/model";
import { IHabit } from "@/src/modules/habits/model";
import { useRewardsState } from "@/src/modules/rewards/context";
import { RewardsService } from "@/src/modules/rewards/api";
import { BundleStatus, ITemptationBundle } from "@/src/modules/rewards/model";
import {
  CoachApiService,
  ICoach,
  InterventionApiService,
  IIntervention,
  InterventionActionType,
} from "@/src/modules/habits/intervention";
import {
  AdaptiveApiService,
  IAdaptationOutcomeEntry,
  IAdaptiveSuggestion,
} from "@/src/modules/habits/adaptive";
import { isSameDateKey, toDateKey } from "@/src/utils/date";
import { getLucideIcon, getCategoryKeyForId } from "@/src/utils/icons";
import { CategoryKey } from "@/src/components/ListRow";

interface HabitDetailScreenProps {
  habitId: string;
}

const todayStr = () => toDateKey(new Date());

export const HabitDetailScreen: React.FC<HabitDetailScreenProps> = ({ habitId }) => {
  const colors = useTheme();
  const { toggleHabit } = useHabitState();
  const { freezeDay } = useRewardsState();

  const [habit, setHabit] = useState<IHabit | null>(null);
  const [reminder, setReminder] = useState<IReminder | null>(null);
  const [bundles, setBundles] = useState<ITemptationBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [insight, setInsight] = useState<IIntervention | null>(null);
  const [coach, setCoach] = useState<ICoach | null>(null);
  const [adaptive, setAdaptive] = useState<IAdaptiveSuggestion | null>(null);
  const [completing, setCompleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);

    HabitService.getById(habitId)
      .then((data) => {
        setHabit(data);
        return ReminderApiService.getByHabit(habitId).catch(() => null);
      })
      .then((rem) => {
        setReminder(rem && (rem as any).id ? (rem as any) : null);
        return RewardsService.listBundles(habitId).catch(() => []);
      })
      .then((bnd) => {
        setBundles(Array.isArray(bnd) ? bnd : []);
        return InterventionApiService.getForHabit(habitId).catch(() => null);
      })
      .then((res) => {
        setInsight(res?.intervention ?? null);
        setCoach(null);
        const enhance = res?.intervention
          ? CoachApiService.getForHabit(habitId)
              .then((c) => setCoach((c as any).coach))
              .catch(() => setCoach(null))
          : Promise.resolve();
        const adapt = AdaptiveApiService.getSuggestion(habitId)
          .then((res) => {
            if (res.suggestion) {
              setAdaptive(res.suggestion);
            } else {
              setAdaptive(null);
            }
          })
          .catch(() => setAdaptive(null));
        return Promise.all([enhance, adapt]);
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

  const completions = useMemo(() => habit?.completions ?? [], [habit]);
  const streak = useMemo(
    () => getCurrentStreak(completions, habit ?? undefined),
    [completions, habit]
  );
  const totalDone = useMemo(
    () => completions.filter((c) => c.status).length,
    [completions]
  );

  const today = todayStr();
  const todayCompletion = completions.find((c) =>
    isSameDateKey(c.date, today)
  );
  const isCompletedToday = Boolean(todayCompletion?.status);
  const [showLogModal, setShowLogModal] = useState(false);

  const handleMarkComplete = useCallback(() => {
    if (!habit || isCompletedToday) return;
    if (habit.goal > 1) {
      setShowLogModal(true);
      return;
    }
    setCompleting(true);
    toggleHabit(habit.id, today)
      .then((rewards) => {
        if (rewards && typeof rewards.coinsAwarded === "number") {
          ToastService.Success("+" + rewards.coinsAwarded + " coins earned!");
        } else {
          ToastService.Success("Habit logged for today!");
        }
        load();
      })
      .catch((err) => ToastService.ApiError(err))
      .finally(() => setCompleting(false));
  }, [habit, isCompletedToday, load, toggleHabit, today]);

  if (error || (!loading && !habit)) {
    return (
      <View className="flex-1 bg-background">
        <View className="h-[56px] px-5 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
          >
            <ArrowLeft size={20} color={colors.inkPrimary} strokeWidth={2} />
          </Pressable>
        </View>
        <ApErrorState onRetry={load} />
      </View>
    );
  }

  const IconComponent = getLucideIcon(habit?.icon || "Check");
  const categoryKey: CategoryKey = habit ? getCategoryKeyForId(habit.id) : "sky";
  const categoryTokens = colors.category[categoryKey];
  const scheduleText = habit ? getScheduleLabel(habit) : "";

  return (
    <View className="flex-1 bg-background">
      {/* Top Navbar */}
      <View className="h-[56px] px-5 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
        >
          <ArrowLeft size={20} color={colors.inkPrimary} strokeWidth={2} />
        </Pressable>
        {habit && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/edit-habit",
                params: { habitId: habit.id },
              })
            }
            hitSlop={8}
            className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
          >
            <MoreHorizontal size={20} color={colors.inkPrimary} strokeWidth={2} />
          </Pressable>
        )}
      </View>

      {loading || !habit ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 110,
          }}
        >
          <View className="flex-row items-center gap-3.5 my-3">
            <Skeleton width={52} height={52} borderRadius={12} />
            <View className="flex-1 gap-2">
              <Skeleton width="60%" height={20} />
              <Skeleton width="40%" height={14} />
            </View>
          </View>

          <SkeletonCard style={{ height: 96, marginVertical: 12 }} />
          <SkeletonCard style={{ height: 140, marginBottom: 16 }} />
          <SkeletonCard style={{ height: 110 }} />
        </ScrollView>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: 110,
            }}
          >
            {/* Habit Header */}
        <View className="flex-row items-center gap-3.5 my-3">
          <View
            className="w-[52px] h-[52px] rounded-md items-center justify-center"
            style={{ backgroundColor: categoryTokens.bg }}
          >
            <IconComponent size={24} color={categoryTokens.ink} strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-[19px] font-bold text-ink-primary">
              {habit.title}
            </Text>
            <Text className="text-[12.5px] font-medium text-ink-secondary mt-0.5">
              {habit.category || "General"} · {scheduleText}
            </Text>
          </View>
        </View>

        {/* Stats Row (Plain numbers per Section 4) */}
        <View className="flex-row items-center justify-between my-4">
          <View>
            <Text className="text-[24px] font-bold text-ink-primary">
              {streak}
            </Text>
            <Text className="text-[11.5px] font-medium text-ink-secondary mt-0.5">
              Day streak
            </Text>
          </View>
          <View>
            <Text className="text-[24px] font-bold text-ink-primary">
              {totalDone}
            </Text>
            <Text className="text-[11.5px] font-medium text-ink-secondary mt-0.5">
              Completed
            </Text>
          </View>
          <View>
            <Text className="text-[24px] font-bold text-ink-primary">
              {habit.goal || 1}
            </Text>
            <Text className="text-[11.5px] font-medium text-ink-secondary mt-0.5">
              Goal / day
            </Text>
          </View>
        </View>

        <View className="h-[1px] bg-border my-2" />

        {/* Coach / Insight Card (Elevated Card 3.3) */}
        {(coach || insight || adaptive) && (
          <View className="my-4">
            <Card elevated>
              <Text className="text-[11px] font-semibold text-ink-tertiary">
                Coach
              </Text>
              <Text className="text-[14.5px] font-bold text-ink-primary mt-1.5">
                {coach?.headline || insight?.title || "Consistency insight"}
              </Text>
              <Text className="text-[12.5px] leading-[18px] text-ink-secondary mt-1.5">
                {coach?.message || insight?.reason || "Keep showing up with regular repetitions."}
              </Text>
            </Card>
          </View>
        )}

        {/* Schedule & Reminder rows */}
        <Text className="text-[12px] font-semibold text-ink-tertiary mt-4 mb-2">
          Schedule
        </Text>
        <View className="bg-background-surface rounded-lg px-4 py-1">
          <ListRow
            title={scheduleText}
            subLabel={"Target: " + (habit.goal || 1) + " " + (habit.unit || "times")}
            icon={Calendar}
            iconBg={colors.backgroundSurface2}
            iconColor={colors.inkSecondary}
            isLast={!reminder}
          />
          {reminder && (
            <ListRow
              title={reminder.time + " reminder"}
              subLabel={reminder.days ? reminder.days.join(", ") : "Every day"}
              icon={Bell}
              iconBg={colors.backgroundSurface2}
              iconColor={colors.inkSecondary}
              isLast={true}
            />
          )}
        </View>

        {/* Behavioral Info if configured */}
        {(habit.minimumBehavior || habit.scheduledTime || habit.location) && (
          <>
            <Text className="text-[12px] font-semibold text-ink-tertiary mt-5 mb-2">
              Behavioral routine
            </Text>
            <View className="bg-background-surface rounded-lg px-4 py-1">
              {habit.scheduledTime && (
                <ListRow
                  title="Cue time"
                  subLabel={habit.scheduledTime + (habit.location ? " · " + habit.location : "")}
                  icon={Clock}
                  iconBg={colors.backgroundSurface2}
                  iconColor={colors.inkSecondary}
                  isLast={!habit.minimumBehavior}
                />
              )}
              {habit.minimumBehavior && (
                <ListRow
                  title="Minimum version"
                  subLabel={habit.minimumBehavior}
                  icon={Sparkles}
                  iconBg={colors.backgroundSurface2}
                  iconColor={colors.inkSecondary}
                  isLast={true}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>

        {/* Pinned Bottom Action Button outside scroll area */}
        <View
          className="absolute bottom-0 left-0 right-0 p-5 bg-background border-t border-border"
          style={{ paddingBottom: 24 }}
        >
          <Button
            label={isCompletedToday ? "Completed today" : "Log today"}
            onPress={handleMarkComplete}
            disabled={isCompletedToday}
            loading={completing}
            variant={isCompletedToday ? "secondary" : "primary"}
          />
        </View>

        {habit && habit.goal > 1 && (
          <LogValueModal
            isVisible={showLogModal}
            onClose={() => setShowLogModal(false)}
            habitId={habit.id}
            habitTitle={habit.title}
            goal={habit.goal}
            currentValue={todayCompletion?.value || 0}
            unit={habit.unit}
            selectedDate={today}
            fullBehavior={habit.fullBehavior}
            minimumBehavior={habit.minimumBehavior}
            emergencyMinimum={habit.emergencyMinimum}
            onSave={(loggedVal, loggedKind) => {
              setCompleting(true);
              toggleHabit(habit.id, today, loggedVal, loggedKind)
                .then((rewards) => {
                  if (rewards && typeof rewards.coinsAwarded === "number") {
                    ToastService.Success("+" + rewards.coinsAwarded + " coins earned!");
                  } else {
                    ToastService.Success("Habit logged for today!");
                  }
                  load();
                })
                .catch((err) => ToastService.ApiError(err))
                .finally(() => setCompleting(false));
            }}
          />
        )}
      </>
    )}
  </View>
);
};

export default HabitDetailScreen;
