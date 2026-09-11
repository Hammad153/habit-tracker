import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApLoader, ApText } from "@/src/components";
import AdminPage from "@/src/modules/admin/components/AdminPage";
import { AdminService } from "@/src/modules/admin/api";
import {
  ErrorState,
  EmptyState,
  MetricCard,
  StatusBadge,
  Row,
  formatDate,
  formatNumber,
  formatPercent,
} from "@/src/modules/admin/components/AdminUI";
import { useTheme } from "@/src/modules/settings/context";
import { ToastService } from "@/src/services";

export default function AdminUserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useTheme();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    if (id)
      AdminService.getUser(id)
        .then(setData)
        .catch(() => setError(true));
  };
  useEffect(load, [id]);
  const toggleStatus = async () => {
    const account = data?.profile ?? data?.user;
    if (!account) return;
    try {
      const next = !account.isSuspended;
      await AdminService.updateUserStatus(
        account.id,
        next,
        next ? "Suspended from admin panel" : "Reactivated from admin panel",
      );
      ToastService.Success(next ? "User suspended" : "User reactivated");
      load();
    } catch (e) {
      ToastService.ApiError(e);
    }
  };
  if (!data && !error) return <ApLoader />;
  if (error)
    return (
      <AdminPage
        title="User details"
        description="Review account information and activity."
      >
        <ErrorState onRetry={load} />
      </AdminPage>
    );
  const user = data?.profile ?? data?.user ?? data;
  if (!user)
    return (
      <AdminPage
        title="User details"
        description="Review account information and activity."
      >
        <EmptyState
          title="User not found"
          description="This account may have been removed."
        />
      </AdminPage>
    );
  return (
    <AdminPage
      title={user.name}
      description={user.email}
      action={
        <Pressable
          onPress={toggleStatus}
          className="rounded-xl px-3 py-2"
          style={{
            backgroundColor: user.isSuspended ? colors.success : colors.danger,
          }}
        >
          <ApText size="sm" font="bold" color={colors.background}>
            {user.isSuspended ? "Reactivate" : "Suspend"}
          </ApText>
        </Pressable>
      }
    >
      <View className="mb-5 flex-row items-center gap-3">
        <StatusBadge
          label={user.isSuspended ? "Suspended" : "Active"}
          tone={user.isSuspended ? "danger" : "success"}
        />
        <ApText size="sm" color={colors.textMuted}>
          {user.role === "ADMIN" ? "Administrator" : "User"}
        </ApText>
      </View>
      <View className="flex-row flex-wrap gap-3">
        <MetricCard label="Habits" value={formatNumber(user.totalHabits)} />
        <MetricCard
          label="Completion"
          value={formatPercent(user.completionRate)}
        />
        <MetricCard
          label="Longest streak"
          value={formatNumber(user.longestStreak)}
        />
        <MetricCard label="Coins" value={formatNumber(user.coins)} />
      </View>
      <View
        className="mt-6 rounded-2xl border p-5"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
        }}
      >
        <ApText size="lg" font="bold">
          Account
        </ApText>
        <Row>
          <ApText size="sm" color={colors.textMuted}>
            Joined
          </ApText>
          <ApText font="bold">{formatDate(user.createdAt)}</ApText>
        </Row>
        <Row>
          <ApText size="sm" color={colors.textMuted}>
            Last updated
          </ApText>
          <ApText font="bold">{formatDate(user.updatedAt)}</ApText>
        </Row>
      </View>
      <View
        className="mt-4 rounded-2xl border p-5"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
        }}
      >
        <ApText size="lg" font="bold">
          Recent habits
        </ApText>
        {data.habits?.length ? (
          data.habits.slice(0, 8).map((habit: any) => (
            <Row key={habit.id}>
              <ApText font="bold">{habit.title}</ApText>
              <ApText size="sm" color={colors.textMuted} className="mt-1">
                {habit.category || "Uncategorized"} ·{" "}
                {formatNumber(habit.completionsCount)} completions
              </ApText>
            </Row>
          ))
        ) : (
          <ApText size="sm" color={colors.textMuted} className="mt-3">
            No habits recorded.
          </ApText>
        )}
      </View>
      <Pressable onPress={() => router.back()} className="mt-5 self-start">
        <ApText font="bold" color={colors.primary}>
          Back to users
        </ApText>
      </Pressable>
    </AdminPage>
  );
}
