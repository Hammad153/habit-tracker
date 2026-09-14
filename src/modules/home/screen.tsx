import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { subDays } from "date-fns";
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

const percent = (value: number, total: number) =>
  total <= 0 ? 0 : Math.round((value / total) * 100);

const getCompletionValue = (habit: any, date: string) =>
  habit?.completions?.find((completion: any) =>
    isSameDateKey(completion?.date, date)
  );

const buildAnalytics = (habits: any[]) => {
  const activeHabits = habits.filter((habit) => !habit.isArchived);
  const todayKey = toDateKey(new Date());
  const todayScheduled = activeHabits.filter((habit) =>
    isHabitScheduledForDate(habit, new Date())
  );
  const habitsCompletedToday = todayScheduled.filter(
    (habit) => getCompletionValue(habit, todayKey)?.status
  ).length;
  const habitsMissedToday = Math.max(todayScheduled.length - habitsCompletedToday, 0);

  const windowDays = Array.from({ length: 30 }, (_, index) =>
    subDays(new Date(), 29 - index)
  );
  const daily = windowDays.map((date) => {
    const key = toDateKey(date);
    const eligibleHabits = activeHabits.filter((habit) =>
      isHabitEligibleForDate(habit, date)
    );
    const scheduled = eligibleHabits.filter((habit) =>
      isHabitScheduledForDate(habit, date)
    );
    const completed = scheduled.filter(
      (habit) => getCompletionValue(habit, key)?.status
    ).length;
    return {
      date: key,
      completed,
      total: scheduled.length,
      rate: percent(completed, scheduled.length),
    };
  });

  const totals = daily.reduce(
    (acc, day) => ({
      completed: acc.completed + day.completed,
      total: acc.total + day.total,
    }),
    { completed: 0, total: 0 }
  );

  let currentStreak = 0;
  for (let i = daily.length - 1; i >= 0; i--) {
    if (daily[i].total === 0) continue;
    if (daily[i].completed > 0) {
      currentStreak++;
    } else if (i === daily.length - 1) {
      continue;
    } else {
      break;
    }
  }

  return {
    totalHabits: activeHabits.length,
    activeHabits,
    habitsCompletedToday,
    habitsMissedToday,
    currentStreak,
    overallRate: percent(totals.completed, totals.total),
  };
};

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
  const { notifications, unreadCount, addNotification } = useNotificationsState();
  const { selectedPlan, fetchPlans } = useDailyPlanState();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const dateStr = useMemo(() => toDateKey(selectedDate), [selectedDate]);
  const analytics = useMemo(() => buildAnalytics(habits), [habits]);

  const streakValue = profile?.currentStreak ?? analytics.currentStreak;

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
