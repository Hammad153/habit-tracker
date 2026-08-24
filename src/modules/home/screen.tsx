import { OverloadApiService, IOverloadReport } from "@/src/modules/analytics/overload";
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
import { useBudgetState } from "@/src/modules/budget/context";
import { useDailyPlanState } from "@/src/modules/daily-plan/context";
import { useIdentitiesState } from "@/src/modules/identities/context";
import { isHabitScheduledForDate } from "@/src/utils/schedule";
import HorizontalDatePicker from "./components/HorizontalDatePicker";
import DailyGoalsCard from "./components/DailyGoalsCard";
import UserGreeting from "./components/UserGreeting";
import HabitCard from "@/src/modules/habits/components/HabitCard";
import UpgradeModal from "@/src/modules/subscription/components/UpgradeModal";
import { MOTIVATION_MESSAGES } from "@/src/constants";
import { isSameDateKey, toDateKey, isHabitEligibleForDate } from "@/src/utils/date";


const percent = (value: number, total: number) =>
  total <= 0 ? 0 : Math.round((value / total) * 100);

const getCompletionValue = (habit: any, date: string) =>
  habit.completions?.find((completion: any) =>
    isSameDateKey(completion.date, date),
  );

const buildAnalytics = (habits: any[]) => {
  const activeHabits = habits.filter((habit) => !habit.isArchived);
  const todayKey = toDateKey(new Date());
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
    const key = toDateKey(date);
    const eligibleHabits = activeHabits.filter((habit) =>
      isHabitEligibleForDate(habit, date),
    );
    const scheduled = eligibleHabits.filter((habit) =>
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
  const { summary: budgetSummary, fetchSummary: fetchBudgetSummary } =
    useBudgetState();
  const { summary: planSummary, fetchSummary: fetchPlanSummary } =
    useDailyPlanState();
  const { activeIdentities, fetchIdentities } = useIdentitiesState();
  // Phase 3.6 — portfolio overload insight (best-effort, never blocking).
  const [overload, setOverload] = useState<IOverloadReport | null>(null);

  useEffect(() => {
    OverloadApiService.get()
      .then(setOverload)
      .catch(() => setOverload(null));
  }, []);

  const loadAll = useCallback(() => {
    if (!user?.id) return Promise.resolve();
    return Promise.all([
      fetchHabits(),
      fetchProfile(),
      fetchSubscription(),
      fetchBudgetSummary(),
      fetchPlanSummary(toDateKey(new Date())),
      fetchIdentities({ silent: true }),
    ]);
  }, [user?.id]);

  useEffect(() => {
    loadAll();
  }, [user?.id]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll().finally(() => setRefreshing(false));
  }, [loadAll]);

  const dateStr = toDateKey(selectedDate);
  const analytics = useMemo(() => buildAnalytics(habits), [habits]);
  const motivation = useMemo(() => {
    const dayIndex = Math.floor(new Date().getTime() / 86400000);
    return MOTIVATION_MESSAGES[dayIndex % MOTIVATION_MESSAGES.length];
  }, []);

  useEffect(() => {
    if (!user?.id || analytics.totalHabits === 0) return;
    const today = toDateKey(new Date());
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
      (h) =>
        !h.isArchived &&
        isHabitScheduledForDate(h, selectedDate) &&
        isHabitEligibleForDate(h, selectedDate),
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
        {/* Greeting */}
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

        <HorizontalDatePicker
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* ── TODAY (primary focus) ─────────────────────────────── */}
        <View className="mt-4 px-2">
          <DailyGoalsCard
            completed={
              scheduledHabits.filter((h: any) =>
                h.completions?.some(
                  (c: any) => isSameDateKey(c.date, dateStr) && c.status,
                ),
              ).length || 0
            }
            total={scheduledHabits.length}
          />
        </View>

        <View className="mt-4 mb-1 px-2">
          <ApText size="sm" font="bold" color={colors.textPrimary}>
            Today’s habits
          </ApText>
        </View>

        <View className="px-2">
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
                habits.length === 0 ? () => router.push("/create-habit") : undefined
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
                  (c: any) => isSameDateKey(c.date, dateStr) && c.status,
                )}
                selectedDate={dateStr}
                onRefresh={() => fetchHabits()}
                goal={habit.goal}
                value={
                  habit.completions?.find((c: any) =>
                    isSameDateKey(c.date, dateStr),
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
              />
            ))
          )}
        </View>

        {/* ── OVERVIEW (secondary metrics, compact grid) ──────────── */}
        <View className="mt-6 px-2">
          <ApText
            size="xs"
            font="bold"
            color={colors.textMuted}
            className="uppercase mb-2"
            style={{ letterSpacing: 1 }}
          >
            Overview
          </ApText>

          {/* Hero: overall progress (single source of the %, plus streaks) */}
          <View
            className="rounded-3xl border p-4"
            style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
          >
            <View className="flex-row items-center">
              <View className="flex-1 pr-3">
                <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase">
                  Last 30 days
                </ApText>
                <ApText size="2xl" font="extrabold" color={colors.textPrimary}>
                  {analytics.overallRate}%
                </ApText>
                <ApText size="xs" color={colors.textSecondary}>
                  {analytics.habitsCompletedToday} done · {analytics.habitsMissedToday} left today
                </ApText>
              </View>
              <View
                className="h-14 w-14 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Ionicons name="trending-up" size={22} color={colors.background} />
              </View>
            </View>

            <View className="mt-3 flex-row">
              {[
                { label: "Streak", value: `${analytics.currentStreak}d` },
                { label: "Best", value: `${analytics.longestStreak}d` },
                { label: "Habits", value: analytics.activeHabits.length },
              ].map((item, index) => (
                <View
                  key={item.label}
                  className={`flex-1 rounded-2xl p-2.5 ${index < 2 ? "mr-2" : ""}`}
                  style={{ backgroundColor: colors.background }}
                >
                  <ApText size="base" font="bold" color={colors.textPrimary}>
                    {item.value}
                  </ApText>
                  <ApText size="xs" color={colors.textMuted} numberOfLines={1}>
                    {item.label}
                  </ApText>
                </View>
              ))}
            </View>
          </View>

          {/* Two-up compact metrics */}
          <View className="flex-row mt-3">
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/daily-plan")}
              className="flex-1 mr-2 rounded-2xl border p-3"
              style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
              accessibilityRole="button"
              accessibilityLabel="Open daily plan"
            >
              <ApText size="xs" font="bold" color={colors.textMuted}>PLAN</ApText>
              <ApText size="xl" font="bold" color={colors.textPrimary} className="mt-0.5">
                {planSummary?.completionPercentage ?? 0}%
              </ApText>
              <ApText size="xs" color={colors.textMuted} numberOfLines={1}>
                {planSummary?.completedTasks ?? 0}/{(planSummary?.completedTasks ?? 0) + (planSummary?.pendingTasks ?? 0)} tasks
              </ApText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/budget")}
              className="flex-1 rounded-2xl border p-3"
              style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
              accessibilityRole="button"
              accessibilityLabel="Open budget"
            >
              <ApText size="xs" font="bold" color={colors.textMuted}>BUDGET</ApText>
              <ApText
                size="xl"
                font="bold"
                color={budgetSummary?.warning ? colors.warning : colors.textPrimary}
                className="mt-0.5"
              >
                {budgetSummary?.budgetUsagePercentage ?? 0}%
              </ApText>
              <ApText size="xs" color={colors.textMuted} numberOfLines={1}>
                used this month
              </ApText>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── INSIGHTS (slim rows, not cards) ────────────────────── */}
        <View className="mt-5 px-2">
          <ApText
            size="xs"
            font="bold"
            color={colors.textMuted}
            className="uppercase mb-2"
            style={{ letterSpacing: 1 }}
          >
            Insights
          </ApText>
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder }}
          >
            {overload?.overloaded && (
              <InsightRow
                icon="layers-outline"
                accent={colors.warning}
                title="Habit load is heavy"
                subtitle={overload.insight.message}
                onPress={() => router.push("/manage-habits")}
                withBorder
              />
            )}
            <InsightRow
              icon="document-text-outline"
              accent={colors.primary}
              title="Your week is ready"
              subtitle="See what your habits are telling you."
              onPress={() => router.push("/weekly-review")}
            />
          </View>
        </View>

        {/* ── IDENTITY strip ─────────────────────────────────────── */}
        {activeIdentities.length > 0 && (
          <View className="mt-5 px-2">
            <View className="flex-row items-center justify-between mb-2">
              <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase" style={{ letterSpacing: 1 }}>
                Becoming
              </ApText>
              <TouchableOpacity onPress={() => router.push("/identities")}>
                <ApText size="xs" font="semibold" color={colors.primary}>
                  Manage →
                </ApText>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {activeIdentities.map((identity) => {
                const accent = identity.color || colors.primary;
                const pct = identity.progressToNextLevel;
                return (
                  <TouchableOpacity
                    key={identity.id}
                    onPress={() => router.push("/identities")}
                    className="mr-2.5 p-3 rounded-2xl border"
                    style={{
                      width: 148,
                      backgroundColor: accent + "0F",
                      borderColor: accent + "33",
                    }}
                  >
                    <View className="flex-row items-center">
                      <Ionicons name={(identity.icon || "flag") as any} size={16} color={accent} />
                      <ApText size="xs" font="bold" color={accent} className="ml-1.5 flex-1" numberOfLines={1}>
                        L{identity.level ?? 1} · {identity.levelTitle}
                      </ApText>
                    </View>
                    <ApText size="sm" font="semibold" color={colors.textPrimary} className="mt-1.5" numberOfLines={1}>
                      {identity.title}
                    </ApText>
                    <ApText size="xs" color={colors.textMuted} className="mt-0.5">
                      {identity.evidencePoints ?? 0} pts
                    </ApText>
                    <View className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.surfaceBorder }}>
                      {pct != null && (
                        <View
                          className="h-full rounded-full"
                          style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: accent }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Quiet motivation line — decorative, no card */}
        <ApText size="xs" color={colors.textMuted} className="text-center mt-5 px-8">
          {motivation}
        </ApText>
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

/* Slim insight row — replaces the old stacked full-width cards. */
const InsightRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  withBorder?: boolean;
}> = ({ icon, accent, title, subtitle, onPress, withBorder }) => {
  const colors = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      className={`flex-row items-center px-4 py-3 ${withBorder ? "border-b" : ""}`}
      style={{ borderBottomColor: colors.surfaceBorder }}
    >
      <Ionicons name={icon} size={18} color={accent} />
      <View className="ml-3 flex-1">
        <ApText size="sm" font="semibold" color={colors.textPrimary}>
          {title}
        </ApText>
        <ApText size="xs" color={colors.textMuted} numberOfLines={1}>
          {subtitle}
        </ApText>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
};

export default HomeScreen;
