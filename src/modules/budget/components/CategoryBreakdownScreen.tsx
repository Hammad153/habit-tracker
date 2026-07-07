import React, { useEffect } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApContainer, ApEmptyState, ApHeader, ApScrollView, ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useBudgetState } from "../context";

const money = (value = 0) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const CategoryBreakdownScreen = () => {
  const colors = useTheme();
  const { summary, fetchSummary } = useBudgetState();

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <ApContainer>
      <ApHeader title="Breakdown" hasBackButton />
      <ApScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {!summary?.categoryBreakdown?.length ? (
          <ApEmptyState icon="pie-chart-outline" title="No breakdown yet" subtitle="Expenses will appear here by category." />
        ) : (
          <View className="mt-4">
            {summary.categoryBreakdown.map((item) => {
              const percentage = summary.totalExpenses ? Math.round((item.total / summary.totalExpenses) * 100) : 0;
              return (
                <View key={item.category} className="mb-4 rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: (item.color || colors.primary) + "18" }}>
                        <Ionicons name={(item.icon as any) || "apps-outline"} size={20} color={item.color || colors.primary} />
                      </View>
                      <View className="ml-3">
                        <ApText size="base" font="bold" color={colors.textPrimary}>
                          {item.category}
                        </ApText>
                        <ApText size="xs" color={colors.textMuted}>
                          {percentage}% of spending
                        </ApText>
                      </View>
                    </View>
                    <ApText size="base" font="bold" color={colors.textPrimary}>
                      {money(item.total)}
                    </ApText>
                  </View>
                  <View className="mt-4 h-3 overflow-hidden rounded-full" style={{ backgroundColor: colors.background }}>
                    <View className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color || colors.primary }} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ApScrollView>
    </ApContainer>
  );
};

export default CategoryBreakdownScreen;
