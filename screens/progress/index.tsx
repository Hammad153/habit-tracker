import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { ApHeader } from "@/components/Header";
import ApContainer from "@/components/containers/container";
import { ApScrollView } from "@/components/ScrollView";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";
import TimeFilterTabs from "../../modules/progress/components/TimeFilterTabs";
import OverviewStats from "../../modules/progress/components/OverviewStats";
import CompletionChart from "../../modules/progress/components/CompletionChart";
import HabitBreakdownCard from "../../modules/progress/components/HabitBreakdownCard";
import ActivityHeatmap from "../../modules/progress/components/ActivityHeatmap";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const HABIT_BREAKDOWN_DATA = [
  {
    id: 1,
    title: "Read Quran",
    category: "Consistency",
    percentage: 80,
    icon: "book",
    iconBg: "rgba(56, 189, 248, 0.2)",
    iconColor: "#38BDF8",
  },
  {
    id: 2,
    title: "Morning Jog",
    category: "Consistency",
    percentage: 65,
    icon: "walk",
    iconBg: "rgba(168, 85, 247, 0.2)",
    iconColor: "#A855F7",
  },
  {
    id: 3,
    title: "Drink Water",
    category: "Consistency",
    percentage: 100,
    icon: "water",
    iconBg: "rgba(16, 185, 129, 0.2)",
    iconColor: "#10B981",
  },
];

export default function ProgressScreen() {
  const [selectedTab, setSelectedTab] = useState<"Week" | "Month" | "Year">(
    "Week",
  );

  return (
    <ApContainer>
      <View className="h-screen bg-background">
        <ApHeader
          title="Progress"
          right={
            <Pressable onPress={() => router.push("/timeline")}>
              <Ionicons
                name="calendar"
                size={24}
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
            <OverviewStats />
            <CompletionChart />

            <View className="mt-4 mb-6">
              <ApText
                size="xl"
                font="bold"
                color={ApTheme.Color.white}
                className="mb-4"
              >
                Habit Breakdown
              </ApText>
              {HABIT_BREAKDOWN_DATA.map((habit) => (
                <HabitBreakdownCard
                  key={habit.id}
                  title={habit.title}
                  category={habit.category}
                  percentage={habit.percentage}
                  icon={habit.icon}
                  iconBg={habit.iconBg}
                  iconColor={habit.iconColor}
                />
              ))}
            </View>
            <View className="mb-20">
              <ApText
                size="xl"
                font="bold"
                color={ApTheme.Color.white}
                className="mb-4"
              >
                Monthly Activity
              </ApText>
              <ActivityHeatmap />
            </View>
          </View>
        </ApScrollView>
      </View>
    </ApContainer>
  );
}
