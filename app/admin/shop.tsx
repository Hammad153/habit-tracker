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
  formatNumber,
} from "@/src/modules/admin/components/AdminUI";
import { useTheme } from "@/src/modules/settings/context";

export default function AdminShop() {
  const colors = useTheme();
  const [items, setItems] = useState<any>(null);
  const [economy, setEconomy] = useState<any>(null);
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    Promise.all([AdminService.getShopItems(), AdminService.getEconomyStats()])
      .then(([shop, stats]) => {
        setItems(shop);
        setEconomy(stats);
      })
      .catch(() => setError(true));
  };
  useEffect(load, []);
  if (!items && !error) return <ApLoader />;
  return (
    <AdminPage
      title="Shop & Economy"
      description="Review catalog availability and economy activity."
    >
      {error ? (
        <ErrorState onRetry={load} />
      ) : (
        <>
          <View className="flex-row flex-wrap gap-3">
            <MetricCard
              label="Total coins earned"
              value={formatNumber(economy?.totalEarned)}
            />
            <MetricCard
              label="Total coins spent"
              value={formatNumber(economy?.totalSpent)}
            />
            <MetricCard
              label="Redemptions"
              value={formatNumber(economy?.redemptions)}
            />
          </View>
          {!items?.length ? (
            <View className="mt-6">
              <EmptyState
                title="No shop items"
                description="The shop catalog is currently empty."
              />
            </View>
          ) : (
            <View
              className="mt-6 rounded-2xl border px-4"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              }}
            >
              {items.map((item: any) => (
                <Row key={item.id}>
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <ApText font="bold">{item.name}</ApText>
                      <ApText
                        size="sm"
                        color={colors.textMuted}
                        className="mt-1"
                      >
                        {item.description || "No description"}
                      </ApText>
                    </View>
                    <StatusBadge
                      label={item.isActive === false ? "Inactive" : "Available"}
                      tone={item.isActive === false ? "neutral" : "success"}
                    />
                  </View>
                  <ApText size="sm" color={colors.textMuted} className="mt-2">
                    Cost: {formatNumber(item.cost)} coins
                  </ApText>
                </Row>
              ))}
            </View>
          )}
        </>
      )}
    </AdminPage>
  );
}
