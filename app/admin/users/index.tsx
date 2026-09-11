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

export default function AdminUsers() {
  const colors = useTheme();
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    AdminService.getUsers({ search: search || undefined, page: 1, limit: 25 })
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
      title="Users"
      description="Search accounts, review status, and inspect user activity."
    >
      <View className="mb-4 flex-row gap-2">
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search name or email"
        />
      </View>
      {error ? (
        <ErrorState onRetry={load} />
      ) : !data?.items?.length ? (
        <EmptyState
          title="No users found"
          description="Try a different search or filter."
        />
      ) : (
        <View
          className="rounded-2xl border px-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
          }}
        >
          {data.items.map((user: any) => (
            <Row key={user.id}>
              <Pressable
                onPress={() => router.push(`/admin/users/${user.id}` as never)}
                accessibilityRole="button"
                accessibilityLabel={`View ${user.name}`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <ApText font="bold" color={colors.textPrimary}>
                      {user.name}
                    </ApText>
                    <ApText size="sm" color={colors.textMuted} className="mt-1">
                      {user.email}
                    </ApText>
                  </View>
                  <StatusBadge
                    label={user.isSuspended ? "Suspended" : "Active"}
                    tone={user.isSuspended ? "danger" : "success"}
                  />
                </View>
                <View className="mt-3 flex-row flex-wrap gap-x-4 gap-y-1">
                  <ApText size="xs" color={colors.textMuted}>
                    {user.role === "ADMIN" ? "Administrator" : "User"}
                  </ApText>
                  <ApText size="xs" color={colors.textMuted}>
                    {formatNumber(user.habitsCount)} habits
                  </ApText>
                  <ApText size="xs" color={colors.textMuted}>
                    {formatNumber(user.coins)} coins
                  </ApText>
                  <ApText size="xs" color={colors.textMuted}>
                    Joined {formatDate(user.createdAt)}
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
