import React, { useEffect } from "react";
import { View } from "react-native";
import {
  ApLoader,
  ApContainer,
  ApHeader,
  ApScrollView,
  ApText,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useProfileState } from "@/src/modules/profile/context";
import { useAwardsState } from "./context";
import LevelProgress from "./components/LevelProgress";
import BadgeCard from "./components/BadgeCard";

const AwardsScreen = () => {
  const { colors } = useSettingsState();
  const {
    loading: loadingAwards,
    badges,
    userBadges,
    fetchBadges,
    fetchUserBadges,
  } = useAwardsState();
  const { profile, loading: loadingProfile, fetchProfile } = useProfileState();

  useEffect(() => {
    fetchBadges();
    fetchUserBadges();
    fetchProfile();
  }, []);

  if (loadingAwards || loadingProfile) {
    return <ApLoader />;
  }

  const STREAK_BADGES =
    badges
      ?.filter((b) => b.type === "STREAK")
      ?.map((badge) => ({
        ...badge,
        isLocked: !userBadges?.some((ub) => ub.badgeId === badge.id),
      })) || [];

  const MILESTONE_BADGES =
    badges
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
};

export default AwardsScreen;
