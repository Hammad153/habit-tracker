import React from "react";
import { View, TouchableOpacity } from "react-native";
import ApLoader from "@/src/components/Loader";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "../../src/components/Text";
import { router } from "expo-router";
import { useTimeline } from "@/hooks/useTimeline";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/src/context/SettingsContext";
import { format } from "date-fns";
import { ApHeader } from "@/src/components/Header";
import ApContainer from "@/src/components/containers/container";
import { ApScrollView } from "@/src/components/ScrollView";

export default function TimelineScreen() {
  const { data: timeline, isLoading: isLoadingTimeline } = useTimeline();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const colors = useTheme();

  const isLoading = isLoadingTimeline || isLoadingProfile;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ApLoader />
      </View>
    );
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
        right={
          <TouchableOpacity
            className="flex-row items-center px-4 py-2 rounded-full border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <Ionicons name="filter" size={16} color={colors.primary} />
            <ApText size="sm" color={colors.textPrimary} className="ml-2">
              Filter
            </ApText>
          </TouchableOpacity>
        }
      />
      <ApScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row px-5 space-x-3 mb-8 mt-4">
          {/* Day Streak Card */}
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

          {/* Completion Card */}
          <View
            className="flex-1 rounded-2xl p-4 items-center justify-center space-y-2"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
              borderWidth: 1,
            }}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center bg-blue-500/20 mb-1">
              <Ionicons name="pie-chart" size={20} color="#38BDF8" />
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

        {/* Timeline */}
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
                  {/* Vertical Line */}
                  {!isLast && (
                    <View
                      className="absolute left-[24px] top-[50px] bottom-[-20px] w-[2px] z-0"
                      style={{ backgroundColor: colors.surfaceBorder }}
                    />
                  )}

                  {/* Icon Column */}
                  <View className="mr-4 items-center z-10">
                    <View
                      className={`w-12 h-12 rounded-full items-center justify-center border-4 border-transparent`}
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

                  {/* Content Card */}
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

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-8 right-5 w-14 h-14 rounded-full items-center justify-center shadow-lg"
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
}
