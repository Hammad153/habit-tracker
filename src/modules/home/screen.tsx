import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { subDays } from "date-fns";
import {
  ApLoader,
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
import { useNotificationsState } from "@/src/modules/notifications/context";
import { isHabitScheduledForDate } from "@/src/utils/schedule";
import HorizontalDatePicker from "./components/HorizontalDatePicker";
import DailyGoalsCard from "./components/DailyGoalsCard";
import UserGreeting from "./components/UserGreeting";
import HabitCard from "@/src/modules/habits/components/HabitCard";
import UpgradeModal from "@/src/modules/subscription/components/UpgradeModal";
import { MOTIVATION_MESSAGES } from "@/src/constants";


const percent = (value: number, total: number) =>
  total <= 0 ? 0 : Math.round((value / total) * 100);

const dateKey = (date: Date) => date.toISOString().split("T")[0];

const getCompletionValue = (habit: any, date: string) =>
  habit.completions?.find((completion: any) => completion.date === date);

const buildAnalytics = (habits: any[]) => {
  const activeHabits = habits.filter((habit) => !habit.isArchived);
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
    { completed: 0, total: 0 },
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
  return {
    activeHabits,
    overallRate: percent(totals.completed, totals.total),
    currentStreak,
    longestStreak,
    habitsCompletedToday,
    habitsMissedToday,
    totalHabits: habits.length,
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 6,
          paddingTop: 8,
          paddingBottom: 96,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View
          style={{
            backgroundColor: colors.surfaceGlow,
            borderRadius: 20,
            paddingLeft: 12,
            paddingRight: 12,
          }}
        >
          <UserGreeting
            userName={profile?.name || "User"}
            unreadCount={unreadCount}
            onNotificationPress={() => router.push("/notifications")}
            onJournalPress={() => router.push("/journal")}
          />
        </View>

        <View className="mt-5 px-2">
          <View
            className="rounded-3xl border p-4"
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
                className="h-20 w-20 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary + "16" }}
              >
                <View
                  className="h-14 w-14 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <ApText size="lg" font="bold" color={colors.background}>
                    {analytics.overallRate}%
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
              ].map((item, index) => (
                <View
                  key={item.label}
                  className={`flex-1 rounded-2xl p-3 ${index < 3 ? "mr-2" : ""}`}
                  style={{ backgroundColor: colors.background }}
                >
                  <ApText size="lg" font="bold" color={colors.textPrimary}>
                    {item.value}
                  </ApText>
                  <ApText size="xs" color={colors.textMuted} numberOfLines={1}>
                    {item.label}
                  </ApText>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="mt-4 px-2">
          <View
            className="rounded-3xl border p-4"
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

        <HorizontalDatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

       <View className="mt-4 px-2">
        <DailyGoalsCard
          completed={
            scheduledHabits.filter((h: any) =>
              h.completions?.some((c: any) => c.date === dateStr && c.status),
            ).length || 0
          }
          total={scheduledHabits.length}
        />
        </View>
        
        <View className="mt-6 mb-20 px-2">
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
      </ScrollView>

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
