import React from "react";
import ApContainer from "@/components/containers/container";
import { ApHeader } from "@/components/Header";
import { View } from "react-native";
import { ApScrollView } from "@/components/ScrollView";
import { ApTheme } from "@/components/theme";
import { ApText } from "@/components/Text";
import LevelProgress from "./components/LevelProgress";
import BadgeCard from "./components/BadgeCard";

const STREAK_BADGES = [
  { id: 1, title: "7 Day Streak", icon: "flame", description: "Completed habits for 7 days in a row", isLocked: false },
  { id: 2, title: "30 Day Streak", icon: "flame", description: "Completed habits for 30 days in a row", isLocked: true },
  { id: 3, title: "100 Day Streak", icon: "flame", description: "Completed habits for 100 days in a row", isLocked: true },
];

const MILESTONE_BADGES = [
  { id: 4, title: "Early Bird", icon: "sunny", description: "Completed 10 morning habits", isLocked: false },
  { id: 5, title: "Night Owl", icon: "moon", description: "Completed 10 evening habits", isLocked: false },
  { id: 6, title: "Habit Master", icon: "trophy", description: "Completed 100 total habits", isLocked: true },
];

export default function AwardsScreen() {
  return (
    <ApContainer>
      <View className="h-screen bg-background">
        <ApHeader title="Awards" />
        <ApScrollView showsVerticalScrollIndicator={false}>
          <LevelProgress level={5} currentXp={750} neededXp={1000} />

          <View className="px-5 mt-4">
            <ApText size="xl" font="bold" color={ApTheme.Color.white} className="mb-4">
              Streak Badges
            </ApText>
            <View className="flex-row flex-wrap justify-between">
              {STREAK_BADGES.map((badge) => (
                <View key={badge.id} style={{ width: "30%" }}>
                  <BadgeCard
                    title={badge.title}
                    icon={badge.icon}
                    description={badge.description}
                    isLocked={badge.isLocked}
                  />
                </View>
              ))}
            </View>
          </View>

          <View className="px-5 mt-8 mb-20">
            <ApText size="xl" font="bold" color={ApTheme.Color.white} className="mb-4">
              Milestones
            </ApText>
            <View className="flex-row flex-wrap justify-between">
              {MILESTONE_BADGES.map((badge) => (
                <View key={badge.id} style={{ width: "30%" }}>
                  <BadgeCard
                    title={badge.title}
                    icon={badge.icon}
                    description={badge.description}
                    isLocked={badge.isLocked}
                  />
                </View>
              ))}
            </View>
          </View>
        </ApScrollView>
      </View>
    </ApContainer>
  );
}
