import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ApContainer,
  ApEmptyState,
  ApErrorState,
  ApHeader,
  ApLoader,
  ApText,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useBudgetState } from "./context";
import { useNotificationsState } from "@/src/modules/notifications/context";
import helper from "@/src/helper";

const StatCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) => {
  const colors = useTheme();
  return (
    <View
      className="flex-1 rounded-2xl border p-3"
      style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
    >
      <View className="mb-2 h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: color + "18" }}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <ApText size="xs" color={colors.textMuted} numberOfLines={1}>
        {label}
      </ApText>
      <ApText size="lg" font="bold" color={colors.textPrimary} numberOfLines={1}>
        {value}
      </ApText>
    </View>
  );
};

const BudgetScreen = () => {
  const colors = useTheme();
  const { loading, error, summary, fetchSummary, ensureCategories } = useBudgetState();
  const { addNotification, notifications } = useNotificationsState();
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => Promise.all([fetchSummary(), ensureCategories()]), []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!summary?.warning) return;
    const today = new Date().toISOString().slice(0, 10);
    const alreadyCreated = notifications.some(
      (notification) =>
        notification.createdAt.startsWith(today) &&
        notification.type === "system" &&
        notification.title === "Budget warning",
    );
    if (alreadyCreated) return;
    addNotification({
      title: "Budget warning",
      body: summary.warning,
      type: "system",
      route: "/(tabs)/budget",
    });
  }, [summary?.warning, addNotification, notifications]);

  const topCategory = useMemo(
    () => summary?.categoryBreakdown?.[0],
    [summary?.categoryBreakdown],
  );

  const onRefresh = () => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  };

  if (loading && !summary && !refreshing) {
    return <ApLoader />;
  }

  if (error && !summary) {
    return (
      <ApContainer>
        <ApHeader title="Budget" hasBackButton/>
        <ApErrorState onRetry={onRefresh} />
      </ApContainer>
    );
  }

  return (
    <ApContainer>
      <ApHeader
        title="Budget"
        hasBackButton
        right={
          <TouchableOpacity onPress={() => router.push("/add-budget")} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.primary }}>
            <Ionicons name="add" size={22} color={colors.background} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-row gap-3">
          <StatCard label="Income" value={helper.formatCurrency(summary?.totalIncome)} icon="trending-up-outline" color={colors.primary} />
          <StatCard label="Expenses" value={helper.formatCurrency(summary?.totalExpenses)} icon="card-outline" color={colors.warning} />
        </View>
        <View className="mt-3 flex-row gap-3">
          <StatCard label="Budget left" value={helper.formatCurrency(summary?.remainingBudget)} icon="wallet-outline" color={summary && summary.remainingBudget < 0 ? "#EF4444" : "#10B981"} />
          <StatCard label="Balance" value={helper.formatCurrency(summary?.remainingBalance)} icon="scale-outline" color={colors.accent} />
        </View>

        <View className="mt-5 rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}>
          <View className="flex-row items-center justify-between">
            <View>
              <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase">
                Budget Progress
              </ApText>
              <ApText size="2xl" font="bold" color={colors.textPrimary} className="mt-1">
                {summary?.budgetUsagePercentage ?? 0}%
              </ApText>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={() => router.push("/budgets")} className="rounded-xl px-3 py-2" style={{ backgroundColor: colors.background }}>
                <ApText size="xs" font="bold" color={colors.textSecondary}>
                  View all
                </ApText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/add-budget")} className="rounded-xl px-3 py-2" style={{ backgroundColor: colors.primary + "18" }}>
                <ApText size="xs" font="bold" color={colors.primary}>
                  Add Budget
                </ApText>
              </TouchableOpacity>
            </View>
          </View>
          <View className="mt-3 h-3 overflow-hidden rounded-full" style={{ backgroundColor: colors.background }}>
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min(summary?.budgetUsagePercentage ?? 0, 100)}%`,
                backgroundColor: (summary?.budgetUsagePercentage ?? 0) >= 100 ? "#EF4444" : colors.primary,
              }}
            />
          </View>
          {summary?.warning ? (
            <View className="mt-3 flex-row items-start rounded-xl p-3" style={{ backgroundColor: "#EF444418" }}>
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
              <ApText size="sm" color="#EF4444" className="ml-2 flex-1">
                {summary.warning}
              </ApText>
            </View>
          ) : null}
        </View>

        <View className="mt-5 flex-row gap-3">
          <TouchableOpacity onPress={() => router.push("/add-expense")} className="flex-1 rounded-2xl p-4" style={{ backgroundColor: colors.warning + "16" }}>
            <Ionicons name="remove-circle-outline" size={22} color={colors.warning} />
            <ApText size="sm" font="bold" color={colors.textPrimary} className="mt-2">
              Add Expense
            </ApText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/add-income")} className="flex-1 rounded-2xl p-4" style={{ backgroundColor: colors.primary + "16" }}>
            <Ionicons name="cash-outline" size={22} color={colors.primary} />
            <ApText size="sm" font="bold" color={colors.textPrimary} className="mt-2">
              Add Income
            </ApText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/expense-history")} className="flex-1 rounded-2xl p-4" style={{ backgroundColor: colors.accent + "16" }}>
            <Ionicons name="list-outline" size={22} color={colors.accent} />
            <ApText size="sm" font="bold" color={colors.textPrimary} className="mt-2">
              History
            </ApText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/category-breakdown")} className="flex-1 rounded-2xl p-4" style={{ backgroundColor: colors.warning + "16" }}>
            <Ionicons name="pie-chart-outline" size={22} color={colors.warning} />
            <ApText size="sm" font="bold" color={colors.textPrimary} className="mt-2">
              Breakdown
            </ApText>
          </TouchableOpacity>
        </View>

        <View className="mt-6">
          <ApText size="lg" font="bold" color={colors.textPrimary} className="mb-3">
            Spending Breakdown
          </ApText>
          {!summary?.categoryBreakdown?.length ? (
            <ApEmptyState icon="wallet-outline" title="No spending yet" subtitle="Add an expense to see your budget picture." />
          ) : (
            summary.categoryBreakdown.map((item) => {
              const width = summary.totalExpenses ? (item.total / summary.totalExpenses) * 100 : 0;
              return (
                <View key={item.category} className="mb-3 rounded-2xl border p-3" style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: (item.color || colors.primary) + "18" }}>
                        <Ionicons name={(item.icon as any) || "apps-outline"} size={16} color={item.color || colors.primary} />
                      </View>
                      <ApText size="sm" font="semibold" color={colors.textPrimary} className="ml-2">
                        {item.category}
                      </ApText>
                    </View>
                    <ApText size="sm" font="bold" color={colors.textPrimary}>
                      {helper.formatCurrency(item.total)}
                    </ApText>
                  </View>
                  <View className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: colors.background }}>
                    <View className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: item.color || colors.primary }} />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {topCategory ? (
          <View className="mt-2 rounded-2xl p-4" style={{ backgroundColor: colors.primary + "12" }}>
            <ApText size="sm" color={colors.textSecondary}>
              Your largest spending category this month is {topCategory.category}. Keep an eye on it if you are trying to stay disciplined.
            </ApText>
          </View>
        ) : null}
      </ScrollView>
    </ApContainer>
  );
};

export default BudgetScreen;
