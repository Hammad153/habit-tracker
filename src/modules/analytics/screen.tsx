import React, { useCallback, useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ApText,
  ApContainer,
  ApHeader,
  ApScrollView,
  ApLoader,
  ApEmptyState,
  ApErrorState,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useAuthState } from "@/src/modules/auth/context";
import axiosInstance from "@/src/libs/axios";

interface AnalyticsData {
  totalHabits: number;
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
  bestDay: string;
  dayDistribution: { day: string; count: number }[];
  habitStreaks: {
    habitId: string;
    habitTitle: string;
    icon: string;
    iconColor: string;
    longestStreak: number;
    totalCompletions: number;
    completionRate: number;
  }[];
  dailyCompletions: { date: string; count: number }[];
  categoryBreakdown: { category: string; count: number; completions: number }[];
}

const AdvancedAnalyticsScreen = () => {
  const { colors } = useSettingsState();
  const { user } = useAuthState();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadAnalytics = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(false);
    axiosInstance
      .get(`/analytics/overview?userId=${user.id}`)
      .then((res) => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <ApContainer>
        <ApHeader title="Analytics" hasBackButton />
        <View className="flex-1 items-center justify-center">
          <ApLoader inline />
        </View>
      </ApContainer>
    );
  }

  if (error) {
    return (
      <ApContainer>
        <ApHeader title="Analytics" hasBackButton />
        <ApErrorState onRetry={loadAnalytics} />
      </ApContainer>
    );
  }

  if (!data || data.totalHabits === 0) {
    return (
      <ApContainer>
        <ApHeader title="Analytics" hasBackButton />
        <ApEmptyState
          icon="bar-chart-outline"
          title="No analytics yet"
          subtitle="Complete a few habits and your insights will show up here."
        />
      </ApContainer>
    );
  }

  const screenWidth = Dimensions.get("window").width - 40;
  const maxDayCount = Math.max(...data.dayDistribution.map((d) => d.count), 1);

  return (
    <ApContainer>
      <ApHeader title="Analytics" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 mt-4">
          {/* Overview Cards */}
          <View className="flex-row gap-3 mb-6">
            <View
              className="flex-1 p-4 rounded-2xl border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              }}
            >
              <ApText size="xs" color={colors.textMuted}>
                Weekly Rate
              </ApText>
              <ApText size="2xl" font="bold" color={colors.primary}>
                {data.weeklyCompletionRate}%
              </ApText>
            </View>
            <View
              className="flex-1 p-4 rounded-2xl border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              }}
            >
              <ApText size="xs" color={colors.textMuted}>
                Monthly Rate
              </ApText>
              <ApText size="2xl" font="bold" color={colors.accent}>
                {data.monthlyCompletionRate}%
              </ApText>
            </View>
            <View
              className="flex-1 p-4 rounded-2xl border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              }}
            >
              <ApText size="xs" color={colors.textMuted}>
                Best Day
              </ApText>
              <ApText size="2xl" font="bold" color={colors.warning}>
                {data.bestDay}
              </ApText>
            </View>
          </View>

          {/* Day Distribution */}
          <View
            className="p-4 rounded-2xl border mb-6"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <ApText
              size="sm"
              font="bold"
              color={colors.textPrimary}
              className="mb-3"
            >
              Completions by Day
            </ApText>
            <View className="flex-row justify-between items-end" style={{ height: 100 }}>
              {data.dayDistribution.map((d) => {
                const height = maxDayCount > 0 ? (d.count / maxDayCount) * 80 : 0;
                return (
                  <View key={d.day} className="items-center flex-1">
                    <ApText size="xs" font="bold" color={colors.primary}>
                      {d.count}
                    </ApText>
                    <View
                      className="w-6 rounded-t-lg mt-1"
                      style={{
                        height: Math.max(height, 4),
                        backgroundColor: colors.primary,
                      }}
                    />
                    <ApText
                      size="xs"
                      color={colors.textMuted}
                      className="mt-1"
                    >
                      {d.day.substring(0, 2)}
                    </ApText>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Category Breakdown */}
          {data.categoryBreakdown.length > 0 && (
            <View
              className="p-4 rounded-2xl border mb-6"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              }}
            >
              <ApText
                size="sm"
                font="bold"
                color={colors.textPrimary}
                className="mb-3"
              >
                Category Breakdown
              </ApText>
              {data.categoryBreakdown.map((cat) => (
                <View
                  key={cat.category}
                  className="flex-row justify-between items-center py-2"
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <ApText size="sm" color={colors.textPrimary}>
                      {cat.category}
                    </ApText>
                  </View>
                  <View className="flex-row items-center">
                    <ApText size="xs" color={colors.textMuted} className="mr-3">
                      {cat.count} habits
                    </ApText>
                    <ApText size="sm" font="bold" color={colors.primary}>
                      {cat.completions}
                    </ApText>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Habit Streaks Leaderboard */}
          <View
            className="p-4 rounded-2xl border mb-6"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <ApText
              size="sm"
              font="bold"
              color={colors.textPrimary}
              className="mb-3"
            >
              Habit Leaderboard
            </ApText>
            {data.habitStreaks.slice(0, 5).map((habit, index) => (
              <View
                key={habit.habitId}
                className="flex-row items-center py-3"
                style={{
                  borderBottomWidth:
                    index < data.habitStreaks.length - 1 ? 1 : 0,
                  borderBottomColor: colors.surfaceBorder,
                }}
              >
                <ApText
                  size="lg"
                  font="bold"
                  color={
                    index === 0
                      ? colors.warning
                      : index === 1
                        ? colors.textSecondary
                        : index === 2
                          ? "#b45309" // bronze — intentional, no theme token
                          : colors.textMuted
                  }
                  className="w-8"
                >
                  #{index + 1}
                </ApText>
                <Ionicons
                  name={habit.icon as any}
                  size={18}
                  color={habit.iconColor}
                />
                <View className="flex-1 ml-2">
                  <ApText
                    size="sm"
                    font="semibold"
                    color={colors.textPrimary}
                  >
                    {habit.habitTitle}
                  </ApText>
                  <ApText size="xs" color={colors.textMuted}>
                    🔥 {habit.longestStreak} day streak •{" "}
                    {habit.totalCompletions} completions
                  </ApText>
                </View>
                <View
                  className="px-2 py-1 rounded-full"
                  style={{ backgroundColor: colors.primary + "20" }}
                >
                  <ApText size="xs" font="bold" color={colors.primary}>
                    {habit.completionRate}%
                  </ApText>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="h-20" />
      </ApScrollView>
    </ApContainer>
  );
};

export default AdvancedAnalyticsScreen;
