import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { format } from "date-fns";
import {
  ApLoader,
  ApText,
  ApContainer,
  ApHeader,
  ApScrollView,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useProfileState } from "@/src/modules/profile/context";
import { useTimelineState } from "./context";

const TimelineScreen = () => {
  const {
    timeline,
    loading: isLoadingTimeline,
    fetchTimeline,
  } = useTimelineState();
  const {
    profile,
    loading: isLoadingProfile,
    fetchProfile,
  } = useProfileState();
  const colors = useTheme();

  useEffect(() => {
    fetchTimeline();
    fetchProfile();
  }, []);

  const isLoading = isLoadingTimeline || isLoadingProfile;

  if (isLoading) {
    return <ApLoader />;
  }

  const completionPercentage = profile?.completionRate
    ? Math.round(profile.completionRate * 100)
    : 0;
  const currentMonthYear = format(new Date(), "MMMM yyyy").toUpperCase();

  return (
    <ApContainer>
      <ApHeader
        title="Your Journey"
        subheader={currentMonthYear}
        hasBackButton
      />
      <ApScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row px-5 space-x-3 mb-8 mt-4">
          <View
            className="flex-1 rounded-2xl p-4 items-center justify-center space-y-2"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
              borderWidth: 1,
            }}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center bg-green-500/20 mb-1">
              <Ionicons name="flame" size={20} color={colors.primary} />
            </View>
            <ApText size="3xl" font="bold" color={colors.textPrimary}>
              {profile?.currentStreak || 0}
            </ApText>
            <ApText
              size="xs"
              color={colors.textSecondary}
              style={{ letterSpacing: 0.5 }}
            >
              DAY STREAK
            </ApText>
          </View>

          <View
            className="flex-1 rounded-2xl p-4 items-center justify-center space-y-2"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
              borderWidth: 1,
            }}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center bg-blue-500/20 mb-1">
              <Ionicons name="pie-chart" size={20} color={colors.accent} />
            </View>
            <ApText size="3xl" font="bold" color={colors.textPrimary}>
              {completionPercentage}%
            </ApText>
            <ApText
              size="xs"
              color={colors.textSecondary}
              style={{ letterSpacing: 0.5 }}
            >
              COMPLETION
            </ApText>
          </View>
        </View>

        <View className="px-5">
          {!timeline || timeline.length === 0 ? (
            <View className="py-10 items-center">
              <ApText color={colors.textMuted}>
                No activities logged yet.
              </ApText>
            </View>
          ) : (
            timeline.map((item, index) => {
              const isLast = index === timeline.length - 1;
              return (
                <View key={item.id} className="flex-row relative">
                  {!isLast && (
                    <View
                      className="absolute left-[24px] top-[50px] bottom-[-20px] w-[2px] z-0"
                      style={{ backgroundColor: colors.surfaceBorder }}
                    />
                  )}

                  <View className="mr-4 items-center z-10">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center border-4 border-transparent"
                      style={{
                        backgroundColor:
                          item.habit?.iconBg || colors.surfaceInactive,
                      }}
                    >
                      <Ionicons
                        name={(item.habit?.icon as any) || "checkmark"}
                        size={24}
                        color={item.habit?.iconColor || "#fff"}
                      />
                    </View>
                  </View>

                  <View
                    className="flex-1 mb-5 rounded-2xl p-4 border"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.surfaceBorder,
                    }}
                  >
                    <View className="flex-row justify-between items-start mb-1">
                      <ApText size="lg" font="bold" color={colors.textPrimary}>
                        {item.habit?.title}
                      </ApText>
                      <ApText
                        size="xs"
                        color={colors.textMuted}
                        className="pt-1"
                      >
                        {format(new Date(item.date), "MMM d, yyyy")}
                      </ApText>
                    </View>

                    <ApText
                      size="base"
                      color={colors.textSecondary}
                      className="mb-3"
                    >
                      {item.habit?.subtitle || "Habit completed!"}
                    </ApText>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ApScrollView>

      <TouchableOpacity
        className="absolute bottom-8 right-5 w-14 h-14 rounded-full items-center justify-center"
        style={{
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
        onPress={() => router.push("/")}
      >
        <Ionicons name="home" size={24} color={colors.background} />
      </TouchableOpacity>

      <TouchableOpacity
        className="absolute bottom-8 left-5 w-12 h-12 rounded-full items-center justify-center border"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
        }}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
    </ApContainer>
  );
};

export default TimelineScreen;
