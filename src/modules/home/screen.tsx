import React, { useCallback, useEffect, useState, useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { format, subDays } from "date-fns";
import {
  ApLoader,
  ApScrollView,
  ApText,
  ApContainer,
  ApEmptyState,
  ApErrorState,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { useProfileState } from "@/src/modules/profile/context";
import { useSubscriptionState } from "@/src/modules/subscription/context";
import { useAuthState } from "@/src/modules/auth/context";
import { useJournalState } from "@/src/modules/journal/context";
import { useNotificationsState } from "@/src/modules/notifications/context";
import { isHabitScheduledForDate } from "@/src/utils/schedule";
import HorizontalDatePicker from "./components/HorizontalDatePicker";
import DailyGoalsCard from "./components/DailyGoalsCard";
import UserGreeting from "./components/UserGreeting";
import HabitCard from "@/src/modules/habits/components/HabitCard";
import UpgradeModal from "@/src/modules/subscription/components/UpgradeModal";

const MOTIVATION_MESSAGES = [
  "Consistency is built in quiet repetitions.",
  "Small promises kept today become identity tomorrow.",
  "Show up for the version of you that asked for change.",
  "Progress loves a repeatable system.",
  "A steady day is still a strong day.",
  "Your habits are votes for your future self.",
  "Discipline gets lighter when it becomes familiar.",
  "Do the next right rep. Momentum will catch up.",
  "Tiny wins count because they compound.",
  "Make today easy to be proud of.",
  "The streak is useful, but the return is the skill.",
  "You do not need perfect energy to keep a promise.",
  "Protect the habit before you polish the outcome.",
  "A good routine lowers the cost of beginning.",
  "The best system is the one you actually repeat.",
  "One completed habit can change the shape of the day.",
  "Consistency is self-trust with a schedule.",
  "Start smaller when life gets loud. Keep the thread.",
  "Your future does not need drama. It needs reps.",
  "Do it gently, do it clearly, do it today.",
  "Attention becomes direction. Direction becomes progress.",
  "A calm checkmark is still a win.",
  "Leave proof that you cared today.",
  "Build the day one useful action at a time.",
  "Keep going long enough for effort to become evidence.",
];

const percent = (value: number, total: number) =>
  total <= 0 ? 0 : Math.round((value / total) * 100);

const dateKey = (date: Date) => date.toISOString().split("T")[0];

const getCompletionValue = (habit: any, date: string) =>
  habit.completions?.find((completion: any) => completion.date === date);

const buildAnalytics = (habits: any[]) => {
  const activeHabits = habits.filter((habit) => !habit.isArchived);
  const completedHabits = habits.filter((habit) => habit.isArchived);
  const todayKey = dateKey(new Date());
  const todayScheduled = activeHabits.filter((habit) =>
    isHabitScheduledForDate(habit, new Date()),
  );
  const habitsCompletedToday = todayScheduled.filter(
    (habit) => getCompletionValue(habit, todayKey)?.status,
  ).length;
  const habitsMissedToday = Math.max(todayScheduled.length - habitsCompletedToday, 0);

  const windowDays = Array.from({ length: 30 }, (_, index) =>
    subDays(new Date(), 29 - index),
  );
  const daily = windowDays.map((date) => {
    const key = dateKey(date);
    const scheduled = activeHabits.filter((habit) =>
      isHabitScheduledForDate(habit, date),
    );
    const completed = scheduled.filter(
      (habit) => getCompletionValue(habit, key)?.status,
    ).length;
    const timeSpent = scheduled.reduce(
      (sum, habit) => sum + (getCompletionValue(habit, key)?.value || 0),
      0,
    );
    return {
      date: key,
      label: format(date, "EEE"),
      completed,
      total: scheduled.length,
      rate: percent(completed, scheduled.length),
      timeSpent,
    };
  });

  const totals = daily.reduce(
    (acc, day) => ({
      completed: acc.completed + day.completed,
      total: acc.total + day.total,
      timeSpent: acc.timeSpent + day.timeSpent,
    }),
    { completed: 0, total: 0, timeSpent: 0 },
  );
  let currentStreak = 0;
  for (const day of daily.slice().reverse()) {
    if (day.total > 0 && day.rate === 100) {
      currentStreak += 1;
    } else {
      break;
    }
  }
  let longestStreak = 0;
  let runningStreak = 0;
  daily.forEach((day) => {
    if (day.total > 0 && day.rate === 100) {
      runningStreak += 1;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  });
  const habitRates = activeHabits.map((habit) => {
    const scheduled = daily.filter((day) =>
      isHabitScheduledForDate(habit, new Date(day.date)),
    );
    const completed = scheduled.filter(
      (day) => getCompletionValue(habit, day.date)?.status,
    ).length;
    return {
      id: habit.id,
      title: habit.title,
      icon: habit.icon,
      color: habit.iconColor,
      rate: percent(completed, scheduled.length),
    };
  });
  const ranked = habitRates.slice().sort((a, b) => b.rate - a.rate);
  const weekly = daily.slice(-7);

  return {
    activeHabits,
    completedHabits,
    daily,
    weekly,
    habitRates,
    overallRate: percent(totals.completed, totals.total),
    weeklyRate: percent(
      weekly.reduce((sum, day) => sum + day.completed, 0),
      weekly.reduce((sum, day) => sum + day.total, 0),
    ),
    monthlyRate: percent(totals.completed, totals.total),
    currentStreak,
    longestStreak,
    habitsCompletedToday,
    habitsMissedToday,
    totalHabits: habits.length,
    totalTimeSpent: totals.timeSpent,
    mostConsistent: ranked[0],
    leastConsistent: ranked[ranked.length - 1],
  };
};

const HomeScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const colors = useTheme();
  const {
    habits,
    loading: loadingHabits,
    error: habitsError,
    fetchHabits,
  } = useHabitState();
  const { profile, loading: loadingProfile, fetchProfile } = useProfileState();
  const { fetchSubscription } = useSubscriptionState();
  const { user } = useAuthState();
  const { entries: journalEntries } = useJournalState();
  const { unreadCount, addNotification, notifications } =
    useNotificationsState();

  const loadAll = useCallback(() => {
    if (!user?.id) return Promise.resolve();
    return Promise.all([fetchHabits(), fetchProfile(), fetchSubscription()]);
  }, [user?.id]);

  useEffect(() => {
    loadAll();
  }, [user?.id]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll().finally(() => setRefreshing(false));
  }, [loadAll]);

  const dateStr = selectedDate.toISOString().split("T")[0];
  const analytics = useMemo(() => buildAnalytics(habits), [habits]);
  const motivation = useMemo(() => {
    const dayIndex = Math.floor(new Date().getTime() / 86400000);
    return MOTIVATION_MESSAGES[dayIndex % MOTIVATION_MESSAGES.length];
  }, []);
  const journalInsights = useMemo(() => {
    const sortedEntries = journalEntries.slice().sort((a, b) => b.date.localeCompare(a.date));
    const entryDates = new Set(sortedEntries.map((entry) => entry.date));
    let streak = 0;
    for (let index = 0; index < 365; index += 1) {
      if (entryDates.has(dateKey(subDays(new Date(), index)))) streak += 1;
      else break;
    }
    return {
      total: journalEntries.length,
      streak,
      lastDate: sortedEntries[0]?.date,
      lastEntry: sortedEntries[0],
      moodTrend: sortedEntries.slice(0, 7).map((entry) => entry.mood).join(", "),
    };
  }, [journalEntries]);

  useEffect(() => {
    if (!user?.id || analytics.totalHabits === 0) return;
    const today = dateKey(new Date());
    const alreadyCreated = notifications.some(
      (notification) =>
        notification.createdAt.startsWith(today) &&
        notification.type === "insight" &&
        notification.title === "Daily habit insight",
    );
    if (alreadyCreated) return;
    addNotification({
      title: "Daily habit insight",
      body:
        analytics.habitsMissedToday > 0
          ? `${analytics.habitsMissedToday} habit${analytics.habitsMissedToday === 1 ? "" : "s"} still need attention today.`
          : "Your scheduled habits are looking clear today.",
      type: "insight",
      route: "/(tabs)",
    });
  }, [
    user?.id,
    analytics.totalHabits,
    analytics.habitsMissedToday,
    addNotification,
    notifications,
  ]);

  // Filter habits by schedule for the selected date
  const scheduledHabits = useMemo(() => {
    if (!habits) return [];
    return habits.filter(
      (h) => !h.isArchived && isHabitScheduledForDate(h, selectedDate),
    );
  }, [habits, selectedDate]);

  if ((loadingHabits || loadingProfile) && !refreshing) {
    return <ApLoader />;
  }

  if (habitsError && habits.length === 0) {
    return (
      <ApContainer>
        <ApErrorState onRetry={handleRefresh} />
      </ApContainer>
    );
  }

  return (
    <ApContainer>
      <ApScrollView
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        <View
          style={{
            backgroundColor: colors.surfaceGlow,
            borderRadius: 20,
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <UserGreeting
            userName={profile?.name || "User"}
            unreadCount={unreadCount}
            onNotificationPress={() => router.push("/notifications")}
          />
        </View>

        <View className="mt-5 px-5">
          <View
            className="rounded-3xl border p-5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase">
                  Overall Progress
                </ApText>
                <ApText size="3xl" font="extrabold" color={colors.textPrimary} className="mt-1">
                  {analytics.overallRate}%
                </ApText>
                <ApText size="sm" color={colors.textSecondary}>
                  {analytics.habitsCompletedToday} done / {analytics.habitsMissedToday} left today
                </ApText>
              </View>
              <View
                className="h-24 w-24 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary + "16" }}
              >
                <View
                  className="h-16 w-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <ApText size="lg" font="bold" color={colors.background}>
                    {analytics.weeklyRate}%
                  </ApText>
                </View>
              </View>
            </View>
            <View className="mt-5 flex-row">
              {[
                { label: "Current", value: `${analytics.currentStreak}d` },
                { label: "Longest", value: `${analytics.longestStreak}d` },
                { label: "Active", value: analytics.activeHabits.length },
                { label: "Total", value: analytics.totalHabits },
              ].map((item) => (
                <View key={item.label} className="mr-2 flex-1 rounded-2xl p-3" style={{ backgroundColor: colors.background }}>
                  <ApText size="lg" font="bold" color={colors.textPrimary}>
                    {item.value}
                  </ApText>
                  <ApText size="xs" color={colors.textMuted}>
                    {item.label}
                  </ApText>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="mt-4 px-5">
          <View
            className="rounded-3xl border p-5"
            style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <ApText size="base" font="bold" color={colors.textPrimary}>
                Weekly Trend
              </ApText>
              <ApText size="xs" color={colors.textMuted}>
                {analytics.totalTimeSpent ? `${analytics.totalTimeSpent} logged` : "Completion"}
              </ApText>
            </View>
            <View className="h-28 flex-row items-end justify-between">
              {analytics.weekly.map((day) => (
                <View key={day.date} className="items-center" style={{ width: 34 }}>
                  <View
                    className="w-7 rounded-t-xl"
                    style={{
                      height: Math.max(8, day.rate),
                      backgroundColor: day.rate >= 80 ? colors.primary : day.rate >= 40 ? colors.warning : colors.surfaceInactive,
                    }}
                  />
                  <ApText size="xs" color={colors.textMuted} className="mt-2">
                    {day.label.slice(0, 1)}
                  </ApText>
                </View>
              ))}
            </View>
            <View className="mt-5 flex-row flex-wrap">
              {analytics.daily.slice(-21).map((day) => (
                <View
                  key={day.date}
                  className="m-0.5 h-4 w-4 rounded"
                  style={{
                    backgroundColor:
                      day.rate >= 80
                        ? colors.primary
                        : day.rate >= 40
                          ? colors.primary + "70"
                          : day.total > 0
                            ? colors.surfaceInactive
                            : colors.background,
                  }}
                />
              ))}
            </View>
          </View>
        </View>

        <View className="mt-4 px-5">
          <View
            className="rounded-3xl border p-5"
            style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
          >
            <View className="flex-row items-start">
              <View
                className="h-11 w-11 rounded-2xl items-center justify-center"
                style={{ backgroundColor: colors.warning + "18" }}
              >
                <Ionicons name="sparkles-outline" size={22} color={colors.warning} />
              </View>
              <View className="ml-3 flex-1">
                <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase">
                  Daily Motivation
                </ApText>
                <ApText size="base" font="semibold" color={colors.textPrimary} className="mt-1">
                  {motivation}
                </ApText>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-4 px-5">
          <View
            className="rounded-3xl border p-5"
            style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <ApText size="base" font="bold" color={colors.textPrimary}>
                Habit Breakdown
              </ApText>
              <ApText size="xs" color={colors.textMuted}>
                Best: {analytics.mostConsistent?.title || "None"}
              </ApText>
            </View>
            {analytics.habitRates.slice(0, 5).map((habit) => (
              <View key={habit.id} className="mb-3">
                <View className="mb-1 flex-row items-center justify-between">
                  <ApText size="sm" color={colors.textSecondary} numberOfLines={1}>
                    {habit.title}
                  </ApText>
                  <ApText size="xs" font="bold" color={colors.textPrimary}>
                    {habit.rate}%
                  </ApText>
                </View>
                <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: colors.background }}>
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${habit.rate}%`,
                      backgroundColor: habit.color || colors.primary,
                    }}
                  />
                </View>
              </View>
            ))}
            {!!analytics.leastConsistent && analytics.leastConsistent.id !== analytics.mostConsistent?.id && (
              <ApText size="xs" color={colors.textMuted} className="mt-1">
                Needs attention: {analytics.leastConsistent.title}
              </ApText>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/journal")}
          className="mt-4 mx-5 rounded-3xl border p-5"
          style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
          activeOpacity={0.85}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <ApText size="base" font="bold" color={colors.textPrimary}>
                Journal Insights
              </ApText>
              <ApText size="sm" color={colors.textSecondary} className="mt-1">
                {journalInsights.total} entries / {journalInsights.streak} day streak
              </ApText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
          {journalInsights.lastEntry && (
            <View className="mt-4 rounded-2xl p-4" style={{ backgroundColor: colors.background }}>
              <ApText size="xs" color={colors.textMuted}>
                Last entry {journalInsights.lastDate}
              </ApText>
              <ApText size="sm" color={colors.textPrimary} className="mt-1" numberOfLines={2}>
                {journalInsights.lastEntry.title}: {journalInsights.lastEntry.content || "No content yet."}
              </ApText>
            </View>
          )}
        </TouchableOpacity>

        <HorizontalDatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <DailyGoalsCard
          completed={
            scheduledHabits.filter((h: any) =>
              h.completions?.some((c: any) => c.date === dateStr && c.status),
            ).length || 0
          }
          total={scheduledHabits.length}
        />

        <View className="mt-6 mb-20">
          <ApText
            size="xl"
            font="bold"
            color={colors.textPrimary}
            className="mb-2"
          >
            Your Habits
          </ApText>
          <View>
            {scheduledHabits.length === 0 ? (
              <ApEmptyState
                icon="calendar-outline"
                title="Nothing scheduled"
                subtitle={
                  habits.length === 0
                    ? "Add a habit to start your day."
                    : "No habits are scheduled for this day."
                }
                actionLabel={habits.length === 0 ? "Create Habit" : undefined}
                onAction={
                  habits.length === 0
                    ? () => router.push("/create-habit")
                    : undefined
                }
              />
            ) : (
              scheduledHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  id={habit.id}
                  title={habit.title}
                  subtitle={habit.subtitle}
                  icon={habit.icon}
                  iconColor={habit.iconColor}
                  iconBg={habit.iconBg}
                  isCompleted={habit.completions?.some(
                    (c: any) => c.date === dateStr && c.status,
                  )}
                  selectedDate={dateStr}
                  onRefresh={() => fetchHabits()}
                  goal={habit.goal}
                  value={
                    habit.completions?.find((c: any) => c.date === dateStr)
                      ?.value || 0
                  }
                />
              ))
            )}
          </View>
        </View>
      </ApScrollView>

      <TouchableOpacity
        onPress={() => router.push("/create-habit")}
        className="absolute bottom-8 right-5 w-16 h-16 rounded-full items-center justify-center z-50"
        style={{
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </TouchableOpacity>

      <UpgradeModal />
    </ApContainer>
  );
};

export default HomeScreen;
