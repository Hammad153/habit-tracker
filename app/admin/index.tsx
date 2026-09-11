import { useTheme } from "@/src/modules/settings/context";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { ApLoader, ApText } from "@/src/components";
import { AdminService } from "@/src/modules/admin/api";
import AdminPage from "@/src/modules/admin/components/AdminPage";
import {
  EmptyState,
  ErrorState,
  MetricCard,
  formatNumber,
} from "@/src/modules/admin/components/AdminUI";

const count = (value: any) =>
  value?.suppressed ? "Protected" : formatNumber(value);

export default function AdminDashboard() {
  const colors = useTheme();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    AdminService.getOverview()
      .then(setData)
      .catch(() => setError(true));
  };
  useEffect(load, []);
  if (!data && !error) return <ApLoader />;
  return (
    <AdminPage
      title="Dashboard"
      description="A privacy-aware overview of Routina activity and platform health."
    >
      {error ? (
        <ErrorState onRetry={load} />
      ) : data ? (
        <>
          <View className="flex-row flex-wrap gap-3">
            <MetricCard
              label="Total active users"
              value={count(data.users?.totalActive)}
            />
            <MetricCard
              label="Active habits"
              value={count(data.habits?.totalActive)}
            />
            <MetricCard
              label="Pending proposals"
              value={count(data.proposals?.pending)}
            />
          </View>
          <View
            className="mt-6 rounded-2xl border p-5"
            style={{
              borderColor: colors.surfaceBorder,
              backgroundColor: colors.surface,
            }}
          >
            <ApText size="lg" font="bold">
              Adaptation outcomes
            </ApText>
            <View className="mt-4 flex-row flex-wrap gap-4">
              <ApText size="sm">
                Improved: {count(data.outcomes?.improved)}
              </ApText>
              <ApText size="sm">
                Unchanged: {count(data.outcomes?.unchanged)}
              </ApText>
              <ApText size="sm">
                Worsened: {count(data.outcomes?.worsened)}
              </ApText>
            </View>
          </View>
          <View
            className="mt-4 rounded-2xl border p-5"
            style={{
              borderColor: colors.surfaceBorder,
              backgroundColor: colors.surface,
            }}
          >
            <ApText size="lg" font="bold">
              Platform activity
            </ApText>
            <ApText size="sm" className="mt-3">
              Notification deliveries:{" "}
              {count(data.notifications?.deliveriesTotal)}
            </ApText>
            <ApText size="sm" className="mt-2">
              Ready weekly reviews: {count(data.reviewsReady)}
            </ApText>
          </View>
        </>
      ) : (
        <EmptyState
          title="No dashboard data"
          description="The API returned no overview metrics."
        />
      )}
    </AdminPage>
  );
}
