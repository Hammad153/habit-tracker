import React, { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ApContainer,
  ApErrorState,
  ApHeader,
  ApLoader,
  ApText,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { ToastService } from "@/src/services";
import {
  IWeeklyReviewResponse,
  WeeklyReviewApiService,
} from "./api";

const SectionCard = ({
  icon,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}) => {
  const colors = useTheme();
  return (
    <View
      className="rounded-2xl p-4 mb-3"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
      }}
    >
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={16} color={colors.primary} />
        <ApText
          size="xs"
          font="bold"
          color={colors.textMuted}
          className="uppercase ml-2"
          style={{ letterSpacing: 1 }}
        >
          {title}
        </ApText>
      </View>
      {children}
    </View>
  );
};

const Bullet = ({ text }: { text: string }) => {
  const colors = useTheme();
  return (
    <View className="flex-row items-start mb-1.5">
      <Ionicons
        name="checkmark-circle"
        size={14}
        color={colors.success}
        style={{ marginTop: 2 }}
      />
      <ApText size="sm" color={colors.textSecondary} className="ml-2 flex-1">
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

  if (loading) return <ApLoader />;

  if (error || !data) {
    return (
      <ApContainer>
        <ApHeader title="Weekly Review" hasBackButton />
        <ApErrorState onRetry={() => { setLoading(true); load(); }} />
      </ApContainer>
    );
  }

  const review = data.review;

  return (
    <ApContainer>
      <ApHeader title="Weekly Review" hasBackButton />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={regenerating} onRefresh={handleRegenerate} />
        }
      >
        {/* Week label + AI badge */}
        <View className="flex-row items-center justify-between mt-2">
          <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase" style={{ letterSpacing: 1 }}>
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
            <ApText size="xl" font="bold" color={colors.textPrimary} className="mt-3">
              {review.headline}
            </ApText>
            <ApText size="sm" color={colors.textSecondary} className="mt-2 mb-4">
              {review.summary}
            </ApText>

            {review.wins.length > 0 && (
              <SectionCard icon="trophy-outline" title="Wins">
                {review.wins.map((w, i) => (
                  <Bullet key={`w-${i}`} text={w} />
                ))}
              </SectionCard>
            )}

            {review.patterns.length > 0 && (
              <SectionCard icon="pulse-outline" title="Patterns">
                {review.patterns.map((p, i) => (
                  <Bullet key={`p-${i}`} text={p} />
                ))}
              </SectionCard>
            )}

            {!!review.identityReflection && (
              <SectionCard icon="person-circle-outline" title="Who you're becoming">
                <ApText size="sm" color={colors.textPrimary}>
                  {review.identityReflection}
                </ApText>
              </SectionCard>
            )}

            {review.nextWeekFocus.length > 0 && (
              <SectionCard icon="flag-outline" title="Next week">
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
                className="h-10 rounded-full items-center justify-center self-end px-5 mt-1"
                style={{
                  backgroundColor: colors.primary + "18",
                  opacity: regenerating ? 0.6 : 1,
                }}
              >
                <ApText size="xs" font="bold" color={colors.primary}>
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
