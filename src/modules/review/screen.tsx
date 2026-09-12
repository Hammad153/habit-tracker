import React, { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Trophy, Activity, User, Flag, RotateCcw, Check } from "lucide-react-native";
import {
  ApContainer,
  ApHeader,
  ApText,
  ApCard,
  SkeletonCard,
} from "@/src/components";
import {
  IWeeklyReviewResponse,
  WeeklyReviewApiService,
} from "./api";
import { useTheme } from "@/src/modules/settings/context";
import { ToastService } from "@/src/services";

const SectionCard = ({
  icon: IconComp,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  children: React.ReactNode;
}) => {
  const colors = useTheme();
  return (
    <ApCard className="p-4 mb-3">
      <View className="flex-row items-center mb-3">
        <IconComp size={16} color={colors.primary} />
        <ApText
          size="xs"
          font="medium"
          color={colors.textMuted}
          className="uppercase ml-2"
          style={{ letterSpacing: 0.8 }}
        >
          {title}
        </ApText>
      </View>
      {children}
    </ApCard>
  );
};

const Bullet = ({ text }: { text: string }) => {
  const colors = useTheme();
  return (
    <View className="flex-row items-start mb-2">
      <View className="mt-0.5 mr-2">
        <Check size={14} color={colors.primary} />
      </View>
      <ApText size="sm" color={colors.textSecondary} className="flex-1">
        {text}
      </ApText>
    </View>
  );
};

const formatWeekLabel = (start: string, end: string): string => {
  const fmt = (key: string) =>
    new Date(`${key}T12:00:00.000Z`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  return `${fmt(start)} – ${fmt(end)}`;
};

const WeeklyReviewScreen = () => {
  const colors = useTheme();
  const [data, setData] = useState<IWeeklyReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const load = useCallback(() => {
    setError(false);
    return WeeklyReviewApiService.get()
      .then((res) => setData(res))
      .catch((err) => {
        setError(true);
        ToastService.ApiError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRegenerate = useCallback(() => {
    if (regenerating || !data?.week) return;
    setRegenerating(true);
    WeeklyReviewApiService.regenerate(data.week.start)
      .then(setData)
      .catch((err) => ToastService.ApiError(err))
      .finally(() => setRegenerating(false));
  }, [regenerating, data]);

  if (loading || !data) {
    return (
      <ApContainer>
        <ApHeader title="Weekly Review" hasBackButton />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}
        >
          <SkeletonCard height={80} className="mt-2 mb-4" />
          <SkeletonCard height={120} className="mb-4" />
          <SkeletonCard height={120} className="mb-4" />
        </ScrollView>
      </ApContainer>
    );
  }

  const review = data.review;

  return (
    <ApContainer>
      <ApHeader title="Weekly Review" hasBackButton />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={regenerating} onRefresh={handleRegenerate} />
        }
      >
        <View className="flex-row items-center justify-between mt-2 mb-3">
          <ApText
            size="xs"
            font="medium"
            color={colors.textMuted}
            className="uppercase"
            style={{ letterSpacing: 0.8 }}
          >
            Your Week · {formatWeekLabel(data.week.start, data.week.end)}
          </ApText>
          {data.inProgress && (
            <ApText size="xs" color={colors.warning}>
              in progress
            </ApText>
          )}
        </View>

        {!review ? (
          <View className="mt-6">
            <ApText size="base" font="semibold" color={colors.textPrimary}>
              Weekly reviews are turned off.
            </ApText>
            <ApText size="sm" color={colors.textMuted} className="mt-2">
              Enable them in Settings → AI Coach to see what your habits are telling you.
            </ApText>
          </View>
        ) : (
          <>
            <ApText size="xl" font="semibold" color={colors.textPrimary} className="mt-1">
              {review.headline}
            </ApText>
            <ApText size="sm" color={colors.textSecondary} className="mt-2 mb-4">
              {review.summary}
            </ApText>

            {review.wins.length > 0 && (
              <SectionCard icon={Trophy} title="Wins">
                {review.wins.map((w, i) => (
                  <Bullet key={`w-${i}`} text={w} />
                ))}
              </SectionCard>
            )}

            {review.patterns.length > 0 && (
              <SectionCard icon={Activity} title="Patterns">
                {review.patterns.map((p, i) => (
                  <Bullet key={`p-${i}`} text={p} />
                ))}
              </SectionCard>
            )}

            {!!review.identityReflection && (
              <SectionCard icon={User} title="Who you are becoming">
                <ApText size="sm" color={colors.textPrimary}>
                  {review.identityReflection}
                </ApText>
              </SectionCard>
            )}

            {review.nextWeekFocus.length > 0 && (
              <SectionCard icon={Flag} title="Next week">
                {review.nextWeekFocus.map((f, i) => (
                  <Bullet key={`f-${i}`} text={f} />
                ))}
              </SectionCard>
            )}

            {!data.inProgress && (
              <Pressable
                onPress={handleRegenerate}
                disabled={regenerating}
                accessibilityRole="button"
                accessibilityLabel="Regenerate weekly review"
                className="h-10 rounded-full items-center justify-center self-end px-5 mt-2 flex-row"
                style={{
                  backgroundColor: colors.accentLight,
                  opacity: regenerating ? 0.6 : 1,
                }}
              >
                <RotateCcw size={14} color={colors.primary} className="mr-1.5" />
                <ApText size="xs" font="semibold" color={colors.primary}>
                  {regenerating ? "Refreshing…" : "Regenerate"}
                </ApText>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </ApContainer>
  );
};

export default WeeklyReviewScreen;
