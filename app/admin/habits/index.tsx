import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { ApLoader, ApText } from "@/src/components";
import AdminPage from "@/src/modules/admin/components/AdminPage";
import { AdminService } from "@/src/modules/admin/api";
import {
  EmptyState,
  ErrorState,
  SearchField,
  StatusBadge,
  Row,
  formatDate,
  formatNumber,
} from "@/src/modules/admin/components/AdminUI";
import { useTheme } from "@/src/modules/settings/context";

export default function AdminHabits() {
  const colors = useTheme();
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    AdminService.getHabits({ search: search || undefined, page: 1, limit: 25 })
      .then(setData)
      .catch(() => setError(true));
  };
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search]);
  if (!data && !error) return <ApLoader />;
  return (
    <AdminPage
      title="Habits"
      description="Inspect habit activity, ownership, and completion volume."
    >
      <View className="mb-4">
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search habits or owners"
        />
      </View>
      {error ? (
        <ErrorState onRetry={load} />
      ) : !data?.items?.length ? (
        <EmptyState
          title="No habits found"
          description="Try a different search."
        />
      ) : (
        <View
          className="rounded-2xl border px-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
          }}
        >
          {data.items.map((habit: any) => (
            <Row key={habit.id}>
              <Pressable
                onPress={() =>
                  router.push(`/admin/habits/${habit.id}` as never)
                }
                accessibilityRole="button"
                accessibilityLabel={`View ${habit.title}`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <ApText font="bold" color={colors.textPrimary}>
                      {habit.title}
                    </ApText>
                    <ApText size="sm" color={colors.textMuted} className="mt-1">
                      {habit.user?.name || "Unknown owner"} ·{" "}
                      {habit.user?.email || ""}
                    </ApText>
                  </View>
                  <StatusBadge
                    label={habit.isArchived ? "Archived" : "Active"}
                    tone={habit.isArchived ? "neutral" : "success"}
                  />
                </View>
                <View className="mt-3 flex-row flex-wrap gap-x-4 gap-y-1">
                  <ApText size="xs" color={colors.textMuted}>
                    {habit.category || "Uncategorized"}
                  </ApText>
                  <ApText size="xs" color={colors.textMuted}>
                    {habit.frequency || habit.scheduleType || "Flexible"}
                  </ApText>
                  <ApText size="xs" color={colors.textMuted}>
                    {formatNumber(habit.completionsCount)} completions
                  </ApText>
                  <ApText size="xs" color={colors.textMuted}>
                    Created {formatDate(habit.createdAt)}
                  </ApText>
                </View>
              </Pressable>
            </Row>
          ))}
        </View>
      )}
      <ApText size="xs" color={colors.textMuted} className="mt-3">
        Showing {data?.items?.length ?? 0} of {formatNumber(data?.total)}
      </ApText>
    </AdminPage>
  );
}
