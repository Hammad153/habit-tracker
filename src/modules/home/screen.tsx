import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import {
  ApEmptyState,
  ApErrorState,
  SkeletonCard,
  SkeletonHabitList,
} from "@/src/components";
import { Card } from "@/src/components/Card";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { useProfileState } from "@/src/modules/profile/context";
import { useAuthState } from "@/src/modules/auth/context";
import { useNotificationsState } from "@/src/modules/notifications/context";
import { useDailyPlanState } from "@/src/modules/daily-plan/context";
import { isHabitScheduledForDate } from "@/src/utils/schedule";
import HorizontalDatePicker from "./components/HorizontalDatePicker";
import DailyGoalsCard from "./components/DailyGoalsCard";
import UserGreeting from "./components/UserGreeting";
import HabitCard from "@/src/modules/habits/components/HabitCard";
import TrialBanner from "@/src/modules/subscription/components/TrialBanner";
import { isSameDateKey, toDateKey, isHabitEligibleForDate } from "@/src/utils/date";

const HomeScreen: React.FC = () => {
  const colors = useTheme();
  const { user } = useAuthState();
  const { profile, loading: loadingProfile, fetchProfile } = useProfileState();
  const {
    habits,
    loading: loadingHabits,
    error: habitsError,
    fetchHabits,
  } = useHabitState();
  const { unreadCount } = useNotificationsState();
  const { selectedPlan, fetchPlans } = useDailyPlanState();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const dateStr = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  // Streak is calculated and returned by the authenticated profile endpoint.
  // Do not fall back to a client approximation, which can disagree with the BE
  // around schedule gaps, archived habits, and timezone boundaries.
  const streakValue = profile?.currentStreak ?? 0;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchHabits(), fetchProfile(), fetchPlans({ date: dateStr })]);
    setRefreshing(false);
  }, [fetchHabits, fetchProfile, fetchPlans, dateStr]);

  useEffect(() => {
    let isMounted = true;
    setInitialLoading(true);
    Promise.all([fetchHabits(), fetchProfile(), fetchPlans({ date: dateStr })]).finally(() => {
      if (isMounted) setInitialLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [user?.id, dateStr]);

  const scheduledHabits = useMemo(() => {
    if (!habits) return [];
    const list = habits.filter(
      (h) =>
        !h.isArchived &&
        isHabitScheduledForDate(h, selectedDate) &&
        isHabitEligibleForDate(h, selectedDate)
    );
    return [...list].sort((a, b) => {
      const aDone = a.completions?.some((c: any) => isSameDateKey(c?.date, dateStr) && c.status) ? 1 : 0;
      const bDone = b.completions?.some((c: any) => isSameDateKey(c?.date, dateStr) && c.status) ? 1 : 0;
      return aDone - bDone;
    });
  }, [habits, selectedDate, dateStr]);

  // Daily plan tasks for selected date
  const todayTasks = useMemo(() => {
    if (!selectedPlan || !isSameDateKey(selectedPlan.planDate ?? "", dateStr)) return [];
    const dailyTasks = (selectedPlan.items ?? selectedPlan.tasks ?? []) as any[];
    if (!dailyTasks.length) return [];
    return dailyTasks.filter(
      (t: any) => !t.planDate || isSameDateKey(t.planDate, dateStr)
    );
  }, [selectedPlan, dateStr]);

  const isInitialLoading =
    (initialLoading || loadingHabits || loadingProfile) && !refreshing && habits.length === 0;

  if (habitsError && habits.length === 0 && !isInitialLoading) {
    return <ApErrorState onRetry={handleRefresh} />;
  }

  const completedCount = scheduledHabits.filter((h: any) =>
    h.completions?.some((c: any) => isSameDateKey(c.date, dateStr) && c.status)
  ).length;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 96,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
        }
      >
        {/* Header with Greeting + Streak */}
        <UserGreeting
          unreadCount={unreadCount}
          streak={streakValue}
          onNotificationPress={() => router.push("/notifications")}
        />

        {/* Date Strip */}
        <HorizontalDatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Dismissible Trial Banner if active */}
        <TrialBanner />

        {/* Daily Goals Ring Card */}
        <View className="mt-4">
          {isInitialLoading ? (
            <SkeletonCard height={96} />
          ) : (
            <DailyGoalsCard
              completed={completedCount}
              total={scheduledHabits.length}
            />
          )}
        </View>

        {/* Up Next / Scheduled Habits */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[12px] font-semibold text-ink-tertiary">
              Up next
            </Text>
            {!isInitialLoading && scheduledHabits.length > 0 && (
              <Pressable onPress={() => router.push("/(tabs)/habits")}>
                <Text className="text-[12px] font-semibold text-accent">
                  All habits
                </Text>
              </Pressable>
            )}
          </View>

          {isInitialLoading ? (
            <SkeletonHabitList count={3} />
          ) : scheduledHabits.length === 0 ? (
            <ApEmptyState
              title="Nothing scheduled"
              description={
                habits.length === 0
                  ? "Create your first habit to start tracking."
                  : "No habits are scheduled for this date."
              }
              actionLabel={habits.length === 0 ? "Create habit" : undefined}
              onAction={
                habits.length === 0 ? () => router.push("/create-habit") : undefined
              }
            />
          ) : (
            <View className="bg-background-surface rounded-lg px-4 py-1">
              {scheduledHabits.map((habit, index) => (
                <HabitCard
                  key={habit.id}
                  id={habit.id}
                  title={habit.title}
                  subtitle={habit.subtitle}
                  icon={habit.icon}
                  iconColor={habit.iconColor}
                  iconBg={habit.iconBg}
                  isCompleted={habit.completions?.some(
                    (c: any) => isSameDateKey(c.date, dateStr) && c.status
                  )}
                  selectedDate={dateStr}
                  onRefresh={fetchHabits}
                  goal={habit.goal}
                  unit={habit.unit}
                  value={
                    habit.completions?.find((c: any) =>
                      isSameDateKey(c.date, dateStr)
                    )?.value || 0
                  }
                  fullBehavior={habit.fullBehavior}
                  minimumBehavior={habit.minimumBehavior}
                  emergencyMinimum={habit.emergencyMinimum}
                  stackAfterTitle={
                    habit.stackAfterHabitId
                      ? habits.find((h: any) => h.id === habit.stackAfterHabitId)?.title
                      : undefined
                  }
                  isLast={index === scheduledHabits.length - 1}
                />
              ))}
            </View>
          )}
        </View>

        {/* Today's plan section if tasks exist */}
        {todayTasks.length > 0 && (
          <View className="mt-6">
            <Text className="text-[12px] font-semibold text-ink-tertiary mb-2">
              Today&apos;s plan
            </Text>
            <View className="gap-2">
              {todayTasks.map((task: any) => (
                <Card key={task.id} className="py-3 px-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[14px] font-bold text-ink-primary">
                      {task.title}
                    </Text>
                    {task.time ? (
                      <Text className="text-[11.5px] font-medium text-ink-tertiary">
                        {task.time}
                      </Text>
                    ) : null}
                  </View>
                  {task.description ? (
                    <Text className="text-[12px] text-ink-secondary mt-1" numberOfLines={1}>
                      {task.description}
                    </Text>
                  ) : null}
                </Card>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
