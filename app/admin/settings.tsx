import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { ApLoader, ApText } from "@/src/components";
import AdminPage from "@/src/modules/admin/components/AdminPage";
import { AdminService } from "@/src/modules/admin/api";
import {
  EmptyState,
  ErrorState,
  Row,
  StatusBadge,
  formatNumber,
} from "@/src/modules/admin/components/AdminUI";
import { useTheme } from "@/src/modules/settings/context";

const label = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
export default function AdminSettings() {
  const colors = useTheme();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    AdminService.getSystemConfig()
      .then(setData)
      .catch(() => setError(true));
  };
  useEffect(load, []);
  if (!data && !error) return <ApLoader />;
  return (
    <AdminPage
      title="Settings"
      description="Read-only system configuration exposed by the backend."
    >
      {error ? (
        <ErrorState onRetry={load} />
      ) : data ? (
        <>
          <View
            className="rounded-2xl border p-5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <Row>
              <ApText size="sm" color={colors.textMuted}>
                Application
              </ApText>
              <ApText font="bold">{data.appName}</ApText>
            </Row>
            <Row>
              <ApText size="sm" color={colors.textMuted}>
                Environment
              </ApText>
              <StatusBadge
                label={data.environment}
                tone={data.environment === "production" ? "success" : "warning"}
              />
            </Row>
            <Row>
              <ApText size="sm" color={colors.textMuted}>
                Trial period
              </ApText>
              <ApText font="bold">
                {formatNumber(data.trialPeriodDays)} days
              </ApText>
            </Row>
            <Row>
              <ApText size="sm" color={colors.textMuted}>
                Paystack
              </ApText>
              <StatusBadge
                label={data.paystackEnabled ? "Enabled" : "Not configured"}
                tone={data.paystackEnabled ? "success" : "neutral"}
              />
            </Row>
            <Row>
              <ApText size="sm" color={colors.textMuted}>
                AI provider
              </ApText>
              <StatusBadge
                label={
                  data.aiProviderConfigured ? "Configured" : "Not configured"
                }
                tone={data.aiProviderConfigured ? "success" : "neutral"}
              />
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
              Reward defaults
            </ApText>
            {Object.entries(data.rewardEngineDefaults || {}).map(
              ([key, value]) => (
                <Row key={key}>
                  <ApText size="sm" color={colors.textMuted}>
                    {label(key)}
                  </ApText>
                  <ApText font="bold">{formatNumber(value)}</ApText>
                </Row>
              ),
            )}
          </View>
        </>
      ) : (
        <EmptyState
          title="No configuration"
          description="The backend returned no system configuration."
        />
      )}
    </AdminPage>
  );
}
