import React, { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApLoader, ApModal, ApText } from "@/src/components";
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
  const [accessModalVisible, setAccessModalVisible] = useState(false);
  const [accessReason, setAccessReason] = useState("");
  const [accessSaving, setAccessSaving] = useState(false);
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
  const subscription = data?.subscription;
  const freeAccessEnabled = Boolean(subscription?.freeAccessEnabled);
  const saveFreeAccess = async () => {
    const account = data?.profile ?? data?.user;
    if (!account) return;
    setAccessSaving(true);
    try {
      await AdminService.updateUserSubscriptionAccess(
        account.id,
        !freeAccessEnabled,
        accessReason.trim() || undefined,
      );
      ToastService.Success(
        freeAccessEnabled ? "Free access removed" : "Free access granted",
      );
      setAccessModalVisible(false);
      setAccessReason("");
      load();
    } catch (e) {
      ToastService.ApiError(e);
    } finally {
      setAccessSaving(false);
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
      <View
        className="mb-4 rounded-2xl border p-5"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <ApText size="lg" font="bold">
              Subscription access
            </ApText>
            <ApText size="sm" color={colors.textMuted} className="mt-2">
              {freeAccessEnabled
                ? "Admin-granted free access"
                : subscription?.status || "Normal subscription rules"}
            </ApText>
          </View>
          <Pressable
            onPress={() => setAccessModalVisible(true)}
            className="rounded-xl px-3 py-2"
            style={{
              backgroundColor: freeAccessEnabled
                ? colors.danger
                : colors.primary,
            }}
          >
            <ApText size="sm" font="bold" color={colors.background}>
              {freeAccessEnabled ? "Remove" : "Grant access"}
            </ApText>
          </Pressable>
        </View>
        {subscription?.freeAccessReason && (
          <ApText size="xs" color={colors.textMuted} className="mt-3">
            Reason: {subscription.freeAccessReason}
          </ApText>
        )}
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
      <ApModal
        visible={accessModalVisible}
        onClose={() => !accessSaving && setAccessModalVisible(false)}
        title={freeAccessEnabled ? "Remove Free Access?" : "Grant Free Access?"}
        subTitle={
          freeAccessEnabled
            ? "This user will return to the normal subscription rules."
            : `${user.name} will use subscription-protected features without purchasing a plan.`
        }
      >
        <TextInput
          value={accessReason}
          onChangeText={setAccessReason}
          placeholder="Reason (optional)"
          placeholderTextColor={colors.textMuted}
          className="rounded-xl border px-4 py-3"
          style={{
            color: colors.textPrimary,
            borderColor: colors.surfaceBorder,
          }}
        />
        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={() => setAccessModalVisible(false)}
            disabled={accessSaving}
            className="flex-1 items-center rounded-xl border py-3"
            style={{ borderColor: colors.surfaceBorder }}
          >
            <ApText font="bold" color={colors.textMuted}>
              Cancel
            </ApText>
          </Pressable>
          <Pressable
            onPress={() => void saveFreeAccess()}
            disabled={accessSaving}
            className="flex-1 items-center rounded-xl py-3"
            style={{
              backgroundColor: freeAccessEnabled
                ? colors.danger
                : colors.primary,
            }}
          >
            <ApText font="bold" color={colors.background}>
              {accessSaving
                ? "Saving..."
                : freeAccessEnabled
                  ? "Remove access"
                  : "Grant access"}
            </ApText>
          </Pressable>
        </View>
      </ApModal>
    </AdminPage>
  );
}
