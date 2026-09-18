import React, { useEffect, useState, useMemo } from "react";
import { View, Pressable } from "react-native";
import { Calendar } from "lucide-react-native";
import { router } from "expo-router";
import {
  ApHeader,
  ApContainer,
  ApScrollView,
  ApText,
  SkeletonHabitList,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { useProfileState } from "@/src/modules/profile/context";
import { useAwardsState } from "@/src/modules/awards/context";
import { PERIOD_DAYS } from "@/src/constants";
import TimeFilterTabs from "./components/TimeFilterTabs";
import CompletionChart from "./components/CompletionChart";
import ActivityHeatmap from "./components/ActivityHeatmap";
import { ProgressHighlights } from "./components/ProgressHighlights";
import { ConsistencyCard } from "./components/ConsistencyCard";
import { GoalSnapshotCard } from "./components/GoalSnapshotCard";
import { getCompletionPercentage as getHabitCompletionPercentage } from "./progress-utils";

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
  const { userBadges, fetchUserBadges } = useAwardsState();

  useEffect(() => {
    fetchHabits();
    fetchProfile();
    fetchUserBadges();
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
        percentage: getHabitCompletionPercentage(habit, days),
        icon: habit.icon,
        iconBg: habit.iconBg,
        iconColor: habit.iconColor,
        completions: habit.completions ?? [],
      }));
  }, [habits, selectedTab]);

  const isLoading = isLoadingHabits || isLoadingProfile;

  return (
    <ApContainer>
      <ApHeader
        title="Progress"
        right={
          <Pressable
            onPress={() => router.push("/timeline")}
            className="w-10 h-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.accentLight }}
          >
            <Calendar size={20} color={colors.primary} />
          </Pressable>
        }
      />
      <ApScrollView showsVerticalScrollIndicator={false}>
        <ProgressHighlights
          streak={profile?.currentStreak ?? 0}
          badges={userBadges.length}
          completionRate={Math.round((profile?.completionRate ?? 0) * 100)}
        />
        <ConsistencyCard
          habits={habits ?? []}
          completionRate={Math.round((profile?.completionRate ?? 0) * 100)}
        />
        <TimeFilterTabs selectedTab={selectedTab} onSelectTab={setSelectedTab} />
        <CompletionChart
          habits={habits ?? []}
          periodDays={PERIOD_DAYS[selectedTab]}
          periodLabel={selectedTab === "Week" ? "this week" : selectedTab === "Month" ? "this month" : "this year"}
        />

        {isLoading ? <SkeletonHabitList count={3} /> : <GoalSnapshotCard goals={habitBreakdown} />}

        <View className="mb-6">
          <ApText
            size="xs"
            font="semibold"
            color={colors.textMuted}
            className="uppercase mb-3"
            style={{ letterSpacing: 0.8 }}
          >
            Activity Heatmap
          </ApText>
        <ActivityHeatmap habits={habits ?? []} />
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default ProgressScreen;
