import React from "react";
import ApContainer from "@/src/components/containers/container";
import { ApHeader } from "@/src/components/Header";
import { View } from "react-native";
import ApLoader from "@/src/components/Loader";
import { ApScrollView } from "@/src/components/ScrollView";
import { ApText } from "@/src/components/Text";
import LevelProgress from "./components/LevelProgress";
import BadgeCard from "./components/BadgeCard";
import { useAwards, useUserBadges } from "@/hooks/useAwards";
import { useProfile } from "@/hooks/useProfile";
import { useSettings } from "@/src/context/SettingsContext";
import { router } from "expo-router";

export default function AwardsScreen() {
  const { colors } = useSettings();
  const { data: allBadges, isLoading: loadingAwards } = useAwards();
  const { data: userBadges, isLoading: loadingUserBadges } = useUserBadges();
  const { data: profile, isLoading: loadingProfile } = useProfile();

  if (loadingAwards || loadingUserBadges || loadingProfile) {
    return <ApLoader />;
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
      <ApHeader title="Awards" />
      <ApScrollView showsVerticalScrollIndicator={false}>
        <LevelProgress
          level={profile?.level || 1}
          currentXp={profile?.xp || 0}
          neededXp={profile?.neededXp || 100}
        />

        <View className="px-5 mt-4">
          <ApText
            size="xl"
            font="bold"
            color={colors.textPrimary}
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
            color={colors.textPrimary}
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
    </ApContainer>
  );
}
