import React, { useEffect, useState } from "react";
import { View } from "react-native";
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

export default function AdminNotifications() {
  const colors = useTheme();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    AdminService.getNotificationOverview()
      .then(setData)
      .catch(() => setError(true));
  };
  useEffect(load, []);
  if (!data && !error) return <ApLoader />;
  return (
    <AdminPage
      title="Notifications"
      description="Monitor delivery records and personalized re-engagement activity."
    >
      {error ? (
        <ErrorState onRetry={load} />
      ) : data ? (
        <>
          <View className="flex-row flex-wrap gap-3">
            <MetricCard
              label="All deliveries"
              value={formatNumber(data.total)}
            />
            <MetricCard
              label="Re-engagement"
              value={formatNumber(data.reengagement)}
            />
          </View>
          <View
            className="mt-6 rounded-2xl border px-4"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <ApText size="lg" font="bold" className="mt-4">
              Recent delivery records
            </ApText>
            {data.recent?.length ? (
              data.recent.map((item: any) => (
                <Row key={item.id}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <ApText font="bold">
                        {item.type.replaceAll("_", " ")}
                      </ApText>
                      <ApText
                        size="sm"
                        color={colors.textMuted}
                        className="mt-1"
                      >
                        {item.user?.name || item.user?.email || "User"} ·{" "}
                        {item.dayKey}
                      </ApText>
                    </View>
                    <StatusBadge
                      label={item.status}
                      tone={item.status === "SURFACED" ? "success" : "neutral"}
                    />
                  </View>
                  <ApText size="xs" color={colors.textMuted} className="mt-2">
                    {item.priority} priority · {formatDate(item.createdAt)}
                  </ApText>
                </Row>
              ))
            ) : (
              <View className="py-6">
                <EmptyState
                  title="No delivery records"
                  description="No notification candidates have been confirmed yet."
                />
              </View>
            )}
          </View>
        </>
      ) : (
        <EmptyState
          title="No notification data"
          description="The notification service returned no overview."
        />
      )}
    </AdminPage>
  );
}
