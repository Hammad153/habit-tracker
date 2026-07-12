import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ApContainer,
  ApEmptyState,
  ApErrorState,
  ApHeader,
  ApLoader,
  ApScrollView,
  ApText,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import helper from "@/src/helper";
import { useBudgetState } from "../context";
import { BudgetPeriodType, IBudget } from "../model";
import {
  budgetSpent,
  formatBudgetRange,
  PERIOD_LABELS,
  PERIOD_TYPES,
  usageColor,
  usagePercentage,
} from "../utils";

type Filter = BudgetPeriodType | "ALL";
const FILTERS: Filter[] = ["ALL", ...PERIOD_TYPES];

const BudgetCard = ({ budget }: { budget: IBudget }) => {
  const colors = useTheme();
  const spent = budgetSpent(budget);
  const percentage = budget.utilisationPercentage ?? usagePercentage(spent, budget.amount);
  const barColor = usageColor(percentage, colors);
  const remaining = budget.remainingAmount ?? budget.amount - spent;

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/budget-detail", params: { id: budget.id } })}
      className="mb-3 rounded-2xl border p-4"
      style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <ApText size="base" font="bold" color={colors.textPrimary} numberOfLines={1}>
            {budget.title}
          </ApText>
          <ApText size="xs" color={colors.textMuted} className="mt-1">
            {formatBudgetRange(budget.startDate, budget.endDate)}
          </ApText>
        </View>
        <View className="rounded-lg px-2 py-1" style={{ backgroundColor: colors.primary + "18" }}>
          <ApText size="xs" font="bold" color={colors.primary}>
            {PERIOD_LABELS[budget.periodType]}
          </ApText>
        </View>
      </View>

      <View className="mt-3 flex-row items-end justify-between">
        <ApText size="lg" font="bold" color={colors.textPrimary}>
          {helper.formatCurrency(budget.plannedAmount ?? budget.amount)}
        </ApText>
        <ApText size="xs" color={colors.textMuted}>
          {helper.formatCurrency(spent)} spent
        </ApText>
      </View>

      <View className="mt-2 h-2 overflow-hidden rounded-full" style={{ backgroundColor: colors.background }}>
        <View
          className="h-full rounded-full"
          style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }}
        />
      </View>

      <View className="mt-2 flex-row items-center justify-between">
        <ApText size="xs" font="semibold" color={barColor}>
          {percentage}% used
        </ApText>
        <ApText size="xs" color={remaining < 0 ? "#EF4444" : colors.textMuted}>
          {remaining < 0
            ? `${helper.formatCurrency(Math.abs(remaining))} over`
            : `${helper.formatCurrency(remaining)} left`}
        </ApText>
      </View>

      {budget.periodType === "WEEKLY" && budget.breakdowns?.length ? (
        <ApText size="xs" color={colors.textMuted} className="mt-2">
          {budget.breakdowns.length} weeks planned
        </ApText>
      ) : null}
    </TouchableOpacity>
  );
};

const BudgetListScreen = () => {
  const colors = useTheme();
  const { budgets, fetchBudgets, loading, error } = useBudgetState();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => fetchBudgets(), []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (filter === "ALL" ? budgets : budgets.filter((item) => item.periodType === filter)),
    [budgets, filter],
  );

  const totals = useMemo(() => {
    const planned = visible.reduce((sum, item) => sum + (item.plannedAmount ?? item.amount), 0);
    const spent = visible.reduce((sum, item) => sum + budgetSpent(item), 0);
    return { planned, spent };
  }, [visible]);

  const onRefresh = () => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  };

  if (loading && !budgets.length && !refreshing) return <ApLoader />;

  if (error && !budgets.length) {
    return (
      <ApContainer>
        <ApHeader title="Budgets" hasBackButton />
        <ApErrorState onRetry={onRefresh} />
      </ApContainer>
    );
  }

  return (
    <ApContainer>
      <ApHeader
        title="Budgets"
        hasBackButton
        right={
          <TouchableOpacity
            onPress={() => router.push("/add-budget")}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            <Ionicons name="add" size={22} color={colors.background} />
          </TouchableOpacity>
        }
      />
      <ApScrollView
        contentContainerStyle={{ paddingBottom: 90 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <View className="mt-3 flex-row flex-wrap gap-2">
          {FILTERS.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setFilter(item)}
              className="rounded-xl px-3 py-2"
              style={{ backgroundColor: filter === item ? colors.primary : colors.surface }}
            >
              <ApText
                size="xs"
                font="bold"
                color={filter === item ? colors.background : colors.textPrimary}
              >
                {item === "ALL" ? "All" : PERIOD_LABELS[item]}
              </ApText>
            </TouchableOpacity>
          ))}
        </View>

        {visible.length ? (
          <View
            className="my-4 flex-row items-center justify-between rounded-2xl p-4"
            style={{ backgroundColor: colors.primary + "12" }}
          >
            <View>
              <ApText size="xs" color={colors.textMuted}>
                Planned
              </ApText>
              <ApText size="lg" font="bold" color={colors.textPrimary}>
                {helper.formatCurrency(totals.planned)}
              </ApText>
            </View>
            <View className="items-end">
              <ApText size="xs" color={colors.textMuted}>
                Spent
              </ApText>
              <ApText size="lg" font="bold" color={colors.warning}>
                {helper.formatCurrency(totals.spent)}
              </ApText>
            </View>
          </View>
        ) : (
          <View className="h-4" />
        )}

        {!visible.length ? (
          <ApEmptyState
            icon="wallet-outline"
            title={filter === "ALL" ? "No budgets yet" : `No ${PERIOD_LABELS[filter as BudgetPeriodType].toLowerCase()} budgets`}
            subtitle="Create a budget to start planning your spending."
            actionLabel="Add Budget"
            onAction={() => router.push("/add-budget")}
          />
        ) : (
          visible.map((budget) => <BudgetCard key={budget.id} budget={budget} />)
        )}
      </ApScrollView>
    </ApContainer>
  );
};

export default BudgetListScreen;
