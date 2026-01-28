import React from "react";
import ApContainer from "@/components/containers/container";
import { ApHeader } from "@/components/Header";
import { View, ActivityIndicator } from "react-native";
import { ApScrollView } from "@/components/ScrollView";
import { ApTheme } from "@/components/theme";
import { ApText } from "@/components/Text";
import LevelProgress from "./components/LevelProgress";
import BadgeCard from "./components/BadgeCard";
import { useAwards, useUserBadges } from "@/hooks/useAwards";

export default function AwardsScreen() {
  const { data: allBadges, isLoading: loadingAwards } = useAwards();
  const { data: userBadges, isLoading: loadingUserBadges } = useUserBadges();

  if (loadingAwards || loadingUserBadges) {
    return (
      <ApContainer>
        <View className="flex-1 justify-center items-center bg-background">
          <ActivityIndicator color={ApTheme.Color.primary} />
        </View>
      </ApContainer>
    );
  }

  const STREAK_BADGES =
    allBadges
      ?.filter((b) => b.type === "STREAK")
      ?.map((badge) => ({
        ...badge,
        isLocked: !userBadges?.some((ub) => ub.badgeId === badge.id),
      })) || [];

  const MILESTONE_BADGES =
    allBadges
      ?.filter((b) => b.type === "MILESTONE")
      ?.map((badge) => ({
        ...badge,
        isLocked: !userBadges?.some((ub) => ub.badgeId === badge.id),
      })) || [];

  return (
    <ApContainer>
      <View className="h-screen bg-background">
        <ApHeader title="Awards" />
        <ApScrollView showsVerticalScrollIndicator={false}>
          <LevelProgress level={5} currentXp={750} neededXp={1000} />

          <View className="px-5 mt-4">
            <ApText
              size="xl"
              font="bold"
              color={ApTheme.Color.white}
              className="mb-4"
            >
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
            <ApText
              size="xl"
              font="bold"
              color={ApTheme.Color.white}
              className="mb-4"
            >
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
