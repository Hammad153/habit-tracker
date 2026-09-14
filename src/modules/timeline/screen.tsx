import React, { useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { format } from "date-fns";
import {
  ApHeader,
  ApEmptyState,
  Skeleton,
  SkeletonHabitList,
} from "@/src/components";
import { ListRow } from "@/src/components/ListRow";
import { useTheme } from "@/src/modules/settings/context";
import { useProfileState } from "@/src/modules/profile/context";
import { useTimelineState } from "./context";
import { CheckCircle } from "lucide-react-native";

export const TimelineScreen = () => {
  const { timeline, loading: isLoadingTimeline, fetchTimeline } = useTimelineState();
  const { profile, loading: isLoadingProfile, fetchProfile } = useProfileState();
  const colors = useTheme();

  useEffect(() => {
    fetchTimeline();
    fetchProfile();
  }, []);

  const isLoading = isLoadingTimeline || isLoadingProfile;

  const completionPercentage = profile?.completionRate
    ? Math.round(profile.completionRate * 100)
    : 0;

  return (
    <View className="flex-1 bg-background">
      <ApHeader
        title="Your journey"
        subtitle={format(new Date(), "MMMM yyyy")}
        hasBackButton
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 }}
      >
        {isLoading && (!timeline || timeline.length === 0) ? (
          <View>
            <View className="flex-row items-center justify-between my-4">
              <View className="gap-2">
                <Skeleton width={50} height={28} />
                <Skeleton width={70} height={14} />
              </View>
              <View className="gap-2 items-end">
                <Skeleton width={60} height={28} />
                <Skeleton width={90} height={14} />
              </View>
            </View>
            <View className="h-[1px] bg-border my-3" />
            <Skeleton width={120} height={16} style={{ marginBottom: 12 }} />
            <SkeletonHabitList count={5} />
          </View>
        ) : (
          <>
            {/* Plain stats numbers per Section 4 */}
            <View className="flex-row items-center justify-between my-4">
              <View>
                <Text className="text-[24px] font-bold text-ink-primary">
                  {profile?.currentStreak || 0}
                </Text>
                <Text className="text-[11.5px] font-medium text-ink-secondary mt-0.5">
                  Day streak
                </Text>
              </View>
              <View>
                <Text className="text-[24px] font-bold text-accent">
                  {completionPercentage}%
                </Text>
                <Text className="text-[11.5px] font-medium text-ink-secondary mt-0.5">
                  Completion rate
                </Text>
              </View>
            </View>

            <View className="h-[1px] bg-border my-3" />

            {/* Timeline list */}
            <Text className="text-[12px] font-semibold text-ink-tertiary mb-3">
              Timeline history
            </Text>

            {!timeline || timeline.length === 0 ? (
              <ApEmptyState
                title="No history logged yet"
                description="Complete your habits to build your personal timeline."
              />
            ) : (
              <View className="bg-background-surface rounded-lg px-4 py-1">
                {timeline.map((event: any, idx: number) => (
                  <ListRow
                    key={event.id || idx}
                    title={event.title || event.habitTitle || "Habit activity"}
                    subLabel={event.date ? format(new Date(event.date), "MMM d, yyyy · h:mm a") : (event.description || "Completed")}
                    icon={CheckCircle}
                    iconBg={colors.accentSoft}
                    iconColor={colors.accent}
                    isLast={idx === timeline.length - 1}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default TimelineScreen;
