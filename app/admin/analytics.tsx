import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { ApLoader, ApText } from "@/src/components";
import AdminPage from "@/src/modules/admin/components/AdminPage";
import { AdminService } from "@/src/modules/admin/api";
import {
  EmptyState,
  ErrorState,
  MetricCard,
  StatusBadge,
  formatNumber,
  formatPercent,
} from "@/src/modules/admin/components/AdminUI";
import { useTheme } from "@/src/modules/settings/context";

const metric = (value: any) =>
  value?.suppressed ? "Protected" : formatNumber(value);
export default function AdminAnalytics() {
  const colors = useTheme();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    AdminService.getDashboard()
      .then(setData)
      .catch(() => setError(true));
  };
  useEffect(load, []);
  if (!data && !error) return <ApLoader />;
  return (
    <AdminPage
      title="Analytics"
      description="Privacy-aware behavioral and platform trends from the admin analytics service."
    >
      {error ? (
        <ErrorState onRetry={load} />
      ) : data ? (
        <>
          <View className="flex-row flex-wrap gap-3">
            <MetricCard
              label="Active users"
              value={metric(data.users?.active)}
            />
            <MetricCard
              label="Analyzed users"
              value={metric(data.users?.analyzed)}
            />
            <MetricCard
              label="Active habits"
              value={metric(data.habits?.active)}
            />
            <MetricCard
              label="Analyzed habits"
              value={metric(data.habits?.analyzed)}
            />
          </View>
          <View
            className="mt-6 rounded-2xl border p-5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <View className="flex-row items-center justify-between">
              <ApText size="lg" font="bold">
                Interventions
              </ApText>
              <StatusBadge
                label={data.behavior?.sampleConfidence || "Sampled"}
                tone="warning"
              />
            </View>
            <View className="mt-4 flex-row flex-wrap gap-4">
              <ApText size="sm">
                Generated: {metric(data.interventions?.generated)}
              </ApText>
              <ApText size="sm">
                Viewed: {metric(data.interventions?.viewed)}
              </ApText>
              <ApText size="sm">
                Completed: {metric(data.interventions?.actionCompleted)}
              </ApText>
              <ApText size="sm">
                Completion rate:{" "}
                {formatPercent(data.interventions?.actionCompletionRate)}
              </ApText>
            </View>
          </View>
          <View
            className="mt-4 rounded-2xl border p-5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <ApText size="lg" font="bold">
              Risk distribution
            </ApText>
            {Object.entries(data.behavior?.riskDistribution || {}).map(
              ([key, value]) => (
                <View key={key} className="mt-3 flex-row justify-between">
                  <ApText size="sm">{key.replaceAll("_", " ")}</ApText>
                  <ApText size="sm" font="bold">
                    {metric(value)}
                  </ApText>
                </View>
              ),
            )}
          </View>
        </>
      ) : (
        <EmptyState
          title="No analytics data"
          description="The analytics service returned no data for this period."
        />
      )}
    </AdminPage>
  );
}
