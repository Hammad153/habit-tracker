import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Award, Flame } from "lucide-react-native";
import {
  ApText,
  ApContainer,
  ApHeader,
  ApScrollView,
  ApEmptyState,
  ApErrorState,
  ApCard,
  SkeletonCard,
  SkeletonStatRow,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useAuthState } from "@/src/modules/auth/context";
import axiosInstance from "@/src/libs/axios";
import { AnalyticsData } from "./model";
import { getHabitLucideIcon } from "@/src/utils/icons";

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
        <ApScrollView showsVerticalScrollIndicator={false}>
          <View className="mt-2">
            <SkeletonStatRow />
            <SkeletonCard style={{ height: 180, marginBottom: 16 }} />
            <SkeletonCard style={{ height: 180, marginBottom: 16 }} />
            <SkeletonCard style={{ height: 160 }} />
          </View>
        </ApScrollView>
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
          title="No analytics yet"
          subtitle="Complete a few habits and your insights will show up here."
        />
      </ApContainer>
    );
  }

  const maxDayCount = Math.max(...data.dayDistribution.map((d) => d.count), 1);
  const totalCompletions = data.habitStreaks.reduce(
    (sum, habit) => sum + habit.totalCompletions,
    0,
  );

  return (
    <ApContainer>
      <ApHeader title="Analytics" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-2">
          {/* Stat Pairs Row 1 */}
          <View className="flex-row items-center justify-around py-4 mb-4">
            <View className="items-center flex-1">
              <ApText
                size="3xl"
                font="semibold"
                color={colors.textPrimary}
                style={{ letterSpacing: -0.5 }}
              >
                {data.weeklyCompletionRate}%
              </ApText>
              <ApText
                size="xs"
                font="medium"
                color={colors.textMuted}
                className="uppercase mt-1"
                style={{ letterSpacing: 0.8 }}
              >
                Weekly Rate
              </ApText>
            </View>

            <View
              className="w-[1px] h-8 self-center"
              style={{ backgroundColor: colors.surfaceBorder }}
            />

            <View className="items-center flex-1">
              <ApText
                size="3xl"
                font="semibold"
                color={colors.textPrimary}
                style={{ letterSpacing: -0.5 }}
              >
                {data.monthlyCompletionRate}%
              </ApText>
              <ApText
                size="xs"
                font="medium"
                color={colors.textMuted}
                className="uppercase mt-1"
                style={{ letterSpacing: 0.8 }}
              >
                Monthly Rate
              </ApText>
            </View>

            <View
              className="w-[1px] h-8 self-center"
              style={{ backgroundColor: colors.surfaceBorder }}
            />

            <View className="items-center flex-1">
              <ApText
                size="3xl"
                font="semibold"
                color={colors.textPrimary}
                style={{ letterSpacing: -0.5 }}
              >
                {data.bestDay.substring(0, 3)}
              </ApText>
              <ApText
                size="xs"
                font="medium"
                color={colors.textMuted}
                className="uppercase mt-1"
                style={{ letterSpacing: 0.8 }}
              >
                Best Day
              </ApText>
            </View>
          </View>

          {/* Stat Pairs Row 2 */}
          <View className="flex-row items-center justify-around py-4 mb-6">
            <View className="items-center flex-1">
              <ApText
                size="3xl"
                font="semibold"
                color={colors.textPrimary}
                style={{ letterSpacing: -0.5 }}
              >
                {data.dailyPlanCompletionRate}%
              </ApText>
              <ApText
                size="xs"
                font="medium"
                color={colors.textMuted}
                className="uppercase mt-1"
                style={{ letterSpacing: 0.8 }}
              >
                Plan Rate
              </ApText>
            </View>

            <View
              className="w-[1px] h-8 self-center"
              style={{ backgroundColor: colors.surfaceBorder }}
            />

            <View className="items-center flex-1">
              <ApText
                size="3xl"
                font="semibold"
                color={colors.textPrimary}
                style={{ letterSpacing: -0.5 }}
              >
                {data.totalHabits}
              </ApText>
              <ApText
                size="xs"
                font="medium"
                color={colors.textMuted}
                className="uppercase mt-1"
                style={{ letterSpacing: 0.8 }}
              >
                Habits
              </ApText>
            </View>

            <View
              className="w-[1px] h-8 self-center"
              style={{ backgroundColor: colors.surfaceBorder }}
            />

            <View className="items-center flex-1">
              <ApText
                size="3xl"
                font="semibold"
                color={colors.textPrimary}
                style={{ letterSpacing: -0.5 }}
              >
                {totalCompletions}
              </ApText>
              <ApText
                size="xs"
                font="medium"
                color={colors.textMuted}
                className="uppercase mt-1"
                style={{ letterSpacing: 0.8 }}
              >
                Total Done
              </ApText>
            </View>
          </View>

          {/* Day Distribution */}
          <ApCard className="p-4 mb-6">
            <ApText
              size="xs"
              font="semibold"
              color={colors.textMuted}
              className="uppercase mb-3"
              style={{ letterSpacing: 0.8 }}
            >
              Completions by Day
            </ApText>
            <View className="flex-row justify-between items-end" style={{ height: 100 }}>
              {data.dayDistribution.map((d) => {
                const height = maxDayCount > 0 ? (d.count / maxDayCount) * 75 : 0;
                return (
                  <View key={d.day} className="items-center flex-1">
                    <ApText size="xs" font="medium" color={colors.textPrimary}>
                      {d.count}
                    </ApText>
                    <View
                      className="w-5 rounded-t mt-1"
                      style={{
                        height: Math.max(height, 4),
                        backgroundColor: colors.primary,
                      }}
                    />
                    <ApText
                      size="xs"
                      color={colors.textMuted}
                      className="mt-1"
                      style={{ fontSize: 11 }}
                    >
                      {d.day.substring(0, 2)}
                    </ApText>
                  </View>
                );
              })}
            </View>
          </ApCard>

          {/* Category Breakdown */}
          {data.categoryBreakdown.length > 0 && (
            <ApCard className="p-4 mb-6">
              <ApText
                size="xs"
                font="semibold"
                color={colors.textMuted}
                className="uppercase mb-3"
                style={{ letterSpacing: 0.8 }}
              >
                Category Breakdown
              </ApText>
              {data.categoryBreakdown.map((cat, i) => (
                <View
                  key={cat.category}
                  className="flex-row justify-between items-center py-2.5"
                  style={{
                    borderTopWidth: i > 0 ? 1 : 0,
                    borderTopColor: colors.surfaceBorder,
                  }}
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-2.5 h-2.5 rounded-full mr-2.5"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <ApText size="sm" font="medium" color={colors.textPrimary}>
                      {cat.category}
                    </ApText>
                  </View>
                  <View className="flex-row items-center">
                    <ApText size="xs" color={colors.textMuted} className="mr-3">
                      {cat.count} habit{cat.count !== 1 ? "s" : ""}
                    </ApText>
                    <ApText size="sm" font="semibold" color={colors.primary}>
                      {cat.completions}
                    </ApText>
                  </View>
                </View>
              ))}
            </ApCard>
          )}

          {/* Habit Streaks Leaderboard */}
          <ApCard className="p-4 mb-6">
            <ApText
              size="xs"
              font="semibold"
              color={colors.textMuted}
              className="uppercase mb-3"
              style={{ letterSpacing: 0.8 }}
            >
              Habit Leaderboard
            </ApText>
            {data.habitStreaks.slice(0, 5).map((habit, index) => {
              const IconComp = getHabitLucideIcon(habit.habitTitle);
              return (
                <View
                  key={habit.habitId}
                  className="flex-row items-center py-3"
                  style={{
                    borderTopWidth: index > 0 ? 1 : 0,
                    borderTopColor: colors.surfaceBorder,
                  }}
                >
                  <ApText
                    size="base"
                    font="semibold"
                    color={index === 0 ? colors.primary : colors.textMuted}
                    className="w-7"
                  >
                    #{index + 1}
                  </ApText>
                  <View
                    className="w-8 h-8 rounded-lg items-center justify-center mr-2.5"
                    style={{ backgroundColor: colors.accentLight }}
                  >
                    <IconComp size={16} color={colors.primary} strokeWidth={2} />
                  </View>
                  <View className="flex-1 min-w-0 mr-2">
                    <ApText
                      size="sm"
                      font="medium"
                      color={colors.textPrimary}
                      numberOfLines={1}
                    >
                      {habit.habitTitle}
                    </ApText>
                    <ApText size="xs" color={colors.textMuted} numberOfLines={1}>
                      {habit.longestStreak} streak · {habit.totalCompletions} completions
                    </ApText>
                  </View>
                  <View
                    className="px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: colors.accentLight }}
                  >
                    <ApText size="xs" font="semibold" color={colors.primary}>
                      {habit.completionRate}%
                    </ApText>
                  </View>
                </View>
              );
            })}
          </ApCard>
        </View>

        <View className="h-20" />
      </ApScrollView>
    </ApContainer>
  );
};

export default AdvancedAnalyticsScreen;
