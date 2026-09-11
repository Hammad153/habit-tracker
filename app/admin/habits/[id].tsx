import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApLoader, ApText } from "@/src/components";
import AdminPage from "@/src/modules/admin/components/AdminPage";
import { AdminService } from "@/src/modules/admin/api";
import {
  EmptyState,
  ErrorState,
  MetricCard,
  Row,
  StatusBadge,
  formatDate,
  formatNumber,
} from "@/src/modules/admin/components/AdminUI";
import { useTheme } from "@/src/modules/settings/context";

export default function AdminHabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (id)
      AdminService.getHabit(id)
        .then(setData)
        .catch(() => setError(true));
  }, [id]);
  if (!data && !error) return <ApLoader />;
  if (error)
    return (
      <AdminPage title="Habit details" description="Review habit activity.">
        <ErrorState
          onRetry={() =>
            id &&
            AdminService.getHabit(id)
              .then(setData)
              .catch(() => setError(true))
          }
        />
      </AdminPage>
    );
  const habit = data?.habit;
  if (!habit)
    return (
      <AdminPage title="Habit details" description="Review habit activity.">
        <EmptyState
          title="Habit not found"
          description="This habit may have been removed."
        />
      </AdminPage>
    );
  return (
    <AdminPage
      title={habit.title}
      description={habit.user?.email || "Habit details"}
    >
      <View className="mb-5 flex-row items-center gap-3">
        <StatusBadge
          label={habit.isArchived ? "Archived" : "Active"}
          tone={habit.isArchived ? "neutral" : "success"}
        />
        <ApText size="sm" color={colors.textMuted}>
          {habit.category || "Uncategorized"}
        </ApText>
      </View>
      <View className="flex-row flex-wrap gap-3">
        <MetricCard
          label="Completions"
          value={formatNumber(data.stats?.totalCompletions)}
        />
        <MetricCard label="Created" value={formatDate(habit.createdAt)} />
      </View>
      <View
        className="mt-6 rounded-2xl border p-5"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
        }}
      >
        <ApText size="lg" font="bold">
          Owner
        </ApText>
        <ApText font="bold" className="mt-3">
          {habit.user?.name || "Unknown"}
        </ApText>
        <ApText size="sm" color={colors.textMuted} className="mt-1">
          {habit.user?.email || ""}
        </ApText>
      </View>
      <View
        className="mt-4 rounded-2xl border p-5"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
        }}
      >
        <ApText size="lg" font="bold">
          Recent completions
        </ApText>
        {data.recentCompletions?.length ? (
          data.recentCompletions.slice(0, 10).map((completion: any) => (
            <Row key={completion.id}>
              <ApText font="bold">{formatDate(completion.date)}</ApText>
              <ApText size="sm" color={colors.textMuted} className="mt-1">
                {completion.kind || "Completed"}
              </ApText>
            </Row>
          ))
        ) : (
          <ApText size="sm" color={colors.textMuted} className="mt-3">
            No completions recorded.
          </ApText>
        )}
      </View>
      <Pressable onPress={() => router.back()} className="mt-5 self-start">
        <ApText font="bold" color={colors.primary}>
          Back to habits
        </ApText>
      </Pressable>
    </AdminPage>
  );
}
