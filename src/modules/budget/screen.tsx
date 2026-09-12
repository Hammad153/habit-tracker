import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, Pressable, View } from "react-native";
import { Plus, ChevronRight, TrendingUp, TrendingDown, DollarSign } from "lucide-react-native";
import { router } from "expo-router";
import {
  ApEmptyState,
  ApErrorState,
  ApHeader,
  Skeleton,
  SkeletonStatRow,
  SkeletonHabitList,
} from "@/src/components";
import { Card } from "@/src/components/Card";
import { Button } from "@/src/components/buttons/Button";
import { ListRow } from "@/src/components/ListRow";
import { ProgressBar } from "@/src/components/ProgressBar";
import { useTheme } from "@/src/modules/settings/context";
import { useBudgetState } from "./context";
import { useNotificationsState } from "@/src/modules/notifications/context";
import helper from "@/src/helper";

export const BudgetScreen = () => {
  const colors = useTheme();
  const { loading, error, summary, fetchSummary, ensureCategories } = useBudgetState();
  const { addNotification, notifications } = useNotificationsState();
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => Promise.all([fetchSummary(), ensureCategories()]), []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  };

  const isInitialLoading = loading && !summary && !refreshing;

  if (error && !summary && !isInitialLoading) {
    return (
      <View className="flex-1 bg-background">
        <ApHeader title="Budget" hasBackButton />
        <ApErrorState onRetry={onRefresh} />
      </View>
    );
  }

  const totalBudget = summary?.totalBudget ?? 0;
  const totalSpent = summary?.totalExpenses ?? 0;
  const remaining = totalBudget - totalSpent;
  const usageRate = totalBudget > 0 ? Math.min(1, totalSpent / totalBudget) : 0;

  return (
    <View className="flex-1 bg-background">
      <ApHeader
        title="Budget"
        hasBackButton
        rightAction={
          <Pressable
            onPress={() => router.push("/add-budget")}
            className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
          >
            <Plus size={20} color={colors.inkPrimary} strokeWidth={2} />
          </Pressable>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 96 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* Plain Stats Numbers (Section 4) */}
        {isInitialLoading ? (
          <SkeletonStatRow className="my-4" />
        ) : (
          <View className="flex-row items-center justify-between my-4">
            <View>
              <Text className="text-[24px] font-bold text-ink-primary">
                ${totalBudget.toLocaleString()}
              </Text>
              <Text className="text-[11.5px] font-medium text-ink-secondary mt-0.5">
                Total budget
              </Text>
            </View>
            <View>
              <Text className="text-[24px] font-bold text-ink-primary">
                ${totalSpent.toLocaleString()}
              </Text>
              <Text className="text-[11.5px] font-medium text-ink-secondary mt-0.5">
                Total spent
              </Text>
            </View>
            <View>
              <Text
                className={"text-[24px] font-bold " + (remaining < 0 ? "text-danger" : "text-accent")}
              >
                ${remaining.toLocaleString()}
              </Text>
              <Text className="text-[11.5px] font-medium text-ink-secondary mt-0.5">
                Remaining
              </Text>
            </View>
          </View>
        )}

        {isInitialLoading ? (
          <Skeleton height={6} radius={3} className="my-3" />
        ) : (
          <ProgressBar
            progress={usageRate}
            tone={usageRate >= 1 ? "danger" : usageRate >= 0.8 ? "warning" : "accent"}
            height={6}
            className="my-3"
          />
        )}

        <View className="h-[1px] bg-border my-3" />

        {/* Quick Actions */}
        <View className="flex-row gap-3 my-3">
          <Pressable
            onPress={() => router.push("/add-expense")}
            className="flex-1 h-[48px] rounded-pill bg-background-surface flex-row items-center justify-center active:opacity-80"
          >
            <TrendingDown size={16} color={colors.danger} strokeWidth={2} />
            <Text className="text-[14px] font-semibold text-ink-primary ml-2">
              Add expense
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/add-income")}
            className="flex-1 h-[48px] rounded-pill bg-background-surface flex-row items-center justify-center active:opacity-80"
          >
            <TrendingUp size={16} color={colors.accent} strokeWidth={2} />
            <Text className="text-[14px] font-semibold text-ink-primary ml-2">
              Add income
            </Text>
          </Pressable>
        </View>

        {/* Active Budgets List */}
        <View className="mt-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[12px] font-semibold text-ink-tertiary">
              Active budgets
            </Text>
            {!isInitialLoading && (
              <Pressable onPress={() => router.push("/budgets")}>
                <Text className="text-[12px] font-semibold text-accent">
                  All budgets
                </Text>
              </Pressable>
            )}
          </View>

          {isInitialLoading ? (
            <SkeletonHabitList count={3} />
          ) : (!summary?.budgets || summary.budgets.length === 0) ? (
            <ApEmptyState
              title="No budgets configured"
              description="Create a monthly or weekly budget to start planning."
              actionLabel="Create budget"
              onAction={() => router.push("/add-budget")}
            />
          ) : (
            <View className="bg-background-surface rounded-lg px-4 py-1 mb-4">
              {summary.budgets.map((b: any, index: number) => {
                const bSpent = b.budgetedExpenseTotal ?? 0;
                const bRate = b.amount > 0 ? Math.round((bSpent / b.amount) * 100) : 0;
                return (
                  <ListRow
                    key={b.id}
                    title={b.title || "Budget"}
                    subLabel={`$${bSpent.toLocaleString()} of $${b.amount.toLocaleString()} (${bRate}%)`}
                    icon={DollarSign}
                    iconBg={colors.backgroundSurface2}
                    iconColor={colors.inkSecondary}
                    trailingControl={
                      <ChevronRight size={18} color={colors.inkTertiary} strokeWidth={2} />
                    }
                    onPress={() =>
                      router.push({
                        pathname: "/budget-detail",
                        params: { budgetId: b.id },
                      })
                    }
                    isLast={index === summary.budgets.length - 1}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* Breakdown Navigation */}
        <View className="mt-2 gap-2">
          <Pressable
            onPress={() => router.push("/category-breakdown")}
            className="flex-row items-center justify-between p-4 rounded-lg bg-background-surface active:opacity-80"
          >
            <Text className="text-[15px] font-medium text-ink-primary">
              Category breakdown
            </Text>
            <ChevronRight size={18} color={colors.inkTertiary} strokeWidth={2} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/expense-history")}
            className="flex-row items-center justify-between p-4 rounded-lg bg-background-surface active:opacity-80"
          >
            <Text className="text-[15px] font-medium text-ink-primary">
              Expense history
            </Text>
            <ChevronRight size={18} color={colors.inkTertiary} strokeWidth={2} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default BudgetScreen;
