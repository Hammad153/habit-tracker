import React, { useState, useMemo } from "react";
import { View, Pressable, ActivityIndicator } from "react-native";
import { ApHeader } from "@/src/components/Header";
import ApContainer from "@/src/components/containers/container";
import { ApScrollView } from "@/src/components/ScrollView";
import { ApText } from "@/src/components/Text";
import TimeFilterTabs from "../../modules/progress/components/TimeFilterTabs";
import OverviewStats from "../../modules/progress/components/OverviewStats";
import CompletionChart from "../../modules/progress/components/CompletionChart";
import HabitBreakdownCard from "../../modules/progress/components/HabitBreakdownCard";
import ActivityHeatmap from "../../modules/progress/components/ActivityHeatmap";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "@/hooks/useHabits";
import { useProfile } from "@/hooks/useProfile";
import { Habit, Completion } from "@/src/types";
import { ApTheme } from "@/src/components/theme";
import { PERIOD_DAYS } from "@/src/constants";

function getCompletionPercentage(habit: Habit, periodDays: number): number {
  const completions = habit.completions ?? [];
  if (completions.length === 0) return 0;

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - periodDays + 1);
  const startStr = startDate.toISOString().split("T")[0];

  const completedInPeriod = completions.filter(
    (c) => c.date >= startStr && c.status,
  ).length;

  return Math.round((completedInPeriod / periodDays) * 100);
}

export default function ProgressScreen() {
  const [selectedTab, setSelectedTab] = useState<"Week" | "Month" | "Year">(
    "Week",
  );
  const { data: habits, isLoading: isLoadingHabits } = useHabits();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();

  const habitBreakdown = useMemo(() => {
    if (!habits) return [];
    const days = PERIOD_DAYS[selectedTab];
    return habits
      .filter((h) => !h.isArchived)
      .map((habit) => ({
        id: habit.id,
        title: habit.title,
        category: habit.category ?? "General",
        percentage: getCompletionPercentage(habit, days),
        icon: habit.icon,
        iconBg: habit.iconBg,
        iconColor: habit.iconColor,
        completions: habit.completions ?? [],
      }));
  }, [habits, selectedTab]);

  const allCompletions = useMemo(() => {
    if (!habits) return [];
    return habits.flatMap((h) => h.completions ?? []);
  }, [habits]);

  const isLoading = isLoadingHabits || isLoadingProfile;

  return (
    <ApContainer>
      <View className="h-screen bg-background">
        <ApHeader
          title="Progress"
          hasBackButton
          onBack={() => router.back()}
          right={
            <Pressable
              onPress={() => router.push("/timeline")}
              className="w-10 h-10 items-center justify-center rounded-full bg-primary/10">
              <Ionicons
                name="calendar"
                size={22}
                color={ApTheme.Color.primary}
              />
            </Pressable>
          }
        />
        <ApScrollView showsVerticalScrollIndicator={false}>
          <View className="px-5">
            <TimeFilterTabs
              selectedTab={selectedTab}
              onSelectTab={setSelectedTab}
            />
            <OverviewStats
              streak={profile?.currentStreak ?? 0}
              totalDone={allCompletions.filter((c) => c.status).length}
            />
            <CompletionChart
              habits={habits ?? []}
              periodDays={PERIOD_DAYS[selectedTab]}
            />

            <View className="mt-4 mb-6">
              <ApText
                size="xl"
                font="bold"
                color={ApTheme.Color.white}
                className="mb-4">
                Habit Breakdown
              </ApText>
              {isLoading ? (
                <ActivityIndicator
                  size="large"
                  color={ApTheme.Color.primary}
                  className="my-4"
                />
              ) : habitBreakdown.length === 0 ? (
                <ApText
                  size="sm"
                  color={ApTheme.Color.textMuted}
                  className="text-center my-4">
                  No habits yet. Create one to see your breakdown!
                </ApText>
              ) : (
                habitBreakdown.map((habit) => (
                  <HabitBreakdownCard
                    key={habit.id}
                    title={habit.title}
                    category={habit.category}
                    percentage={habit.percentage}
                    icon={habit.icon}
                    iconBg={habit.iconBg}
                    iconColor={habit.iconColor}
                    completions={habit.completions}
                  />
                ))
              )}
            </View>
            <View className="mb-20">
              <ApText
                size="xl"
                font="bold"
                color={ApTheme.Color.white}
                className="mb-4">
                Monthly Activity
              </ApText>
              <View className="mb-20">
                <ActivityHeatmap completions={allCompletions} />
              </View>
            </View>
          </View>
        </ApScrollView>
      </View>
    </ApContainer>
  );
}
