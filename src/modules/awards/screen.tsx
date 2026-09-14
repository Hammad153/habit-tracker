import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Lock, Award } from "lucide-react-native";
import {
  ApContainer,
  ApHeader,
  ApScrollView,
  ApText,
  ApCelebration,
  BottomSheet,
  ProgressBar,
  SkeletonCard,
  SkeletonBadgeGrid,
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

  const [selectedUnlockedBadge, setSelectedUnlockedBadge] = useState<any | null>(null);
  const [selectedLockedBadge, setSelectedLockedBadge] = useState<any | null>(null);

  useEffect(() => {
    fetchBadges();
    fetchUserBadges();
    fetchProfile();
  }, []);

  const isInitialLoading = loadingAwards || loadingProfile;

  const STREAK_BADGES =
    badges
      ?.filter((b) => b.type === "STREAK")
      ?.map((badge) => {
        const earned = userBadges?.find((ub) => ub.badgeId === badge.id);
        return {
          ...badge,
          isLocked: !earned,
          earnedAt: earned?.earnedAt,
        };
      }) || [];

  const MILESTONE_BADGES =
    badges
      ?.filter((b) => b.type === "MILESTONE")
      ?.map((badge) => {
        const earned = userBadges?.find((ub) => ub.badgeId === badge.id);
        return {
          ...badge,
          isLocked: !earned,
          earnedAt: earned?.earnedAt,
        };
      }) || [];

  return (
    <ApContainer>
      <ApHeader title="Awards" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        {isInitialLoading ? (
          <SkeletonCard height={110} className="mb-4 mt-2" />
        ) : (
          <LevelProgress
            level={profile?.level || 1}
            currentXp={profile?.xp || 0}
            neededXp={profile?.neededXp || 100}
          />
        )}

        <View className="mt-4">
          <ApText
            size="xs"
            font="semibold"
            color={colors.textMuted}
            className="uppercase mb-3"
            style={{ letterSpacing: 0.8 }}
          >
            Streak Badges
          </ApText>
          {isInitialLoading ? (
            <SkeletonBadgeGrid count={6} />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {STREAK_BADGES.map((badge) => (
                <View key={badge.id} style={{ width: "31%" }}>
                  <BadgeCard
                    title={badge.title}
                    icon={badge.icon}
                    description={badge.description}
                    isLocked={badge.isLocked}
                    earnedAt={badge.earnedAt}
                    onPress={() => {
                      if (badge.isLocked) {
                        setSelectedLockedBadge(badge);
                      } else {
                        setSelectedUnlockedBadge(badge);
                      }
                    }}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="mt-6 mb-6">
          <ApText
            size="xs"
            font="semibold"
            color={colors.textMuted}
            className="uppercase mb-3"
            style={{ letterSpacing: 0.8 }}
          >
            Milestone Badges
          </ApText>
          {isInitialLoading ? (
            <SkeletonBadgeGrid count={6} />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {MILESTONE_BADGES.map((badge) => (
                <View key={badge.id} style={{ width: "31%" }}>
                  <BadgeCard
                    title={badge.title}
                    icon={badge.icon}
                    description={badge.description}
                    isLocked={badge.isLocked}
                    earnedAt={badge.earnedAt}
                    onPress={() => {
                      if (badge.isLocked) {
                        setSelectedLockedBadge(badge);
                      } else {
                        setSelectedUnlockedBadge(badge);
                      }
                    }}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ApScrollView>

      {/* Celebration modal for unlocked badge */}
      {selectedUnlockedBadge && (
        <ApCelebration
          visible={!!selectedUnlockedBadge}
          milestone={selectedUnlockedBadge.title}
          subtext={selectedUnlockedBadge.description}
          onDismiss={() => setSelectedUnlockedBadge(null)}
        />
      )}

      {/* Bottom sheet for locked badge */}
      <BottomSheet
        visible={!!selectedLockedBadge}
        onClose={() => setSelectedLockedBadge(null)}
      >
        {selectedLockedBadge && (
          <View className="items-center py-2">
            <View
              className="w-14 h-14 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: colors.surface2 }}
            >
              <Lock size={24} color={colors.textMuted} />
            </View>
            <ApText size="lg" font="semibold" color={colors.textPrimary}>
              {selectedLockedBadge.title}
            </ApText>
            <ApText size="sm" color={colors.textMuted} textAlign="center" className="mt-1 mb-5">
              {selectedLockedBadge.description}
            </ApText>
            <View className="w-full mb-4">
              <View className="flex-row justify-between mb-1.5">
                <ApText size="xs" color={colors.textMuted}>
                  Unlock Criteria
                </ApText>
                <ApText size="xs" font="medium" color={colors.primary}>
                  In progress
                </ApText>
              </View>
              <ProgressBar progress={0.35} height={6} />
            </View>
          </View>
        )}
      </BottomSheet>
    </ApContainer>
  );
};

export default AwardsScreen;
