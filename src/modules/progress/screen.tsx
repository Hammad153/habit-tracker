import React, { useEffect, useState, useMemo } from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ApLoader,
  ApHeader,
  ApContainer,
  ApScrollView,
  ApText,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { useProfileState } from "@/src/modules/profile/context";
import { IHabit } from "@/src/modules/habits/model";
import { PERIOD_DAYS } from "@/src/constants";
import TimeFilterTabs from "./components/TimeFilterTabs";
import OverviewStats from "./components/OverviewStats";
import CompletionChart from "./components/CompletionChart";
import HabitBreakdownCard from "./components/HabitBreakdownCard";
import ActivityHeatmap from "./components/ActivityHeatmap";

const getCompletionPercentage = (habit: IHabit, periodDays: number): number => {
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
};

const ProgressScreen = () => {
  const { colors } = useSettingsState();
  const [selectedTab, setSelectedTab] = useState<"Week" | "Month" | "Year">(
    "Week",
  );
  const { habits, loading: isLoadingHabits, fetchHabits } = useHabitState();
  const {
    profile,
    loading: isLoadingProfile,
    fetchProfile,
  } = useProfileState();

  useEffect(() => {
    fetchHabits();
    fetchProfile();
  }, []);

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
      <ApHeader
        title="Progress"
        right={
          <Pressable
            onPress={() => router.push("/timeline")}
            className="w-10 h-10 items-center justify-center rounded-full bg-primary/10"
          >
            <Ionicons name="calendar" size={22} color={colors.primary} />
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
              color={colors.textPrimary}
              className="mb-4"
            >
              Habit Breakdown
            </ApText>
            {isLoading ? (
              <ApLoader size="small" inline />
            ) : habitBreakdown.length === 0 ? (
              <ApText
                size="sm"
                color={colors.textMuted}
                className="text-center my-4"
              >
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
              color={colors.textPrimary}
              className="mb-4"
            >
              Monthly Activity
            </ApText>
            <View className="mb-20">
              <ActivityHeatmap completions={allCompletions} />
            </View>
          </View>
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default ProgressScreen;
