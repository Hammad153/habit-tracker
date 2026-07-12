import React, { useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ApConfirmModal,
  ApContainer,
  ApEmptyState,
  ApHeader,
  ApLoader,
  ApScrollView,
  ApText,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import helper from "@/src/helper";
import { useBudgetState } from "../context";
import { IBudget } from "../model";
import {
  budgetSpent,
  durationInDays,
  formatBudgetRange,
  formatRange,
  PERIOD_HELPERS,
  PERIOD_LABELS,
  spentByCategory,
  spentInRange,
  usageColor,
  usagePercentage,
} from "../utils";

const DANGER = "#EF4444";

const SectionTitle = ({ children }: { children: React.ReactNode }) => {
  const colors = useTheme();
  return (
    <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 mt-5 uppercase">
      {children}
    </ApText>
  );
};

const Row = ({ label, value, color }: { label: string; value: string; color?: string }) => {
  const colors = useTheme();
  return (
    <View className="flex-row items-center justify-between py-1">
      <ApText size="sm" color={colors.textSecondary}>
        {label}
      </ApText>
      <ApText size="sm" font="bold" color={color ?? colors.textPrimary}>
        {value}
      </ApText>
    </View>
  );
};

const ProgressBar = ({ percentage, color }: { percentage: number; color: string }) => {
  const colors = useTheme();
  return (
    <View className="h-3 overflow-hidden rounded-full" style={{ backgroundColor: colors.background }}>
      <View
        className="h-full rounded-full"
        style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }}
      />
    </View>
  );
};

const WeeklyBreakdown = ({ budget }: { budget: IBudget }) => {
  const colors = useTheme();
  if (!budget.breakdowns?.length) return null;

  return (
    <>
      <SectionTitle>Weekly breakdown</SectionTitle>
      {budget.breakdowns.map((week) => {
        const start = week.startDate.slice(0, 10);
        const end = week.endDate.slice(0, 10);
        const spent = spentInRange(budget, start, end);
        const percentage = usagePercentage(spent, week.amount);
        const barColor = usageColor(percentage, colors);

        return (
          <View
            key={week.id}
            className="mb-3 rounded-2xl border p-3"
            style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
          >
            <View className="flex-row items-center justify-between">
              <ApText size="sm" font="bold" color={colors.textPrimary}>
                {week.label}
              </ApText>
              <ApText size="xs" color={colors.textMuted}>
                {formatRange(start, end)}
              </ApText>
            </View>
            <View className="mb-2 mt-2 flex-row items-end justify-between">
              <ApText size="base" font="bold" color={colors.textPrimary}>
                {helper.formatCurrency(week.amount)}
              </ApText>
              <ApText size="xs" color={barColor}>
                {helper.formatCurrency(spent)} spent
              </ApText>
            </View>
            <ProgressBar percentage={percentage} color={barColor} />
            {week.note ? (
              <ApText size="xs" color={colors.textMuted} className="mt-2">
                {week.note}
              </ApText>
            ) : null}
          </View>
        );
      })}
    </>
  );
};

const CategoryAllocations = ({ budget }: { budget: IBudget }) => {
  const colors = useTheme();
  const spentPerCategory = useMemo(() => spentByCategory(budget), [budget]);
  if (!budget.allocations?.length) return null;

  const allocated = budget.allocations.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <SectionTitle>Category breakdown</SectionTitle>
      {budget.allocations.map((allocation) => {
        const spent = spentPerCategory[allocation.categoryId] ?? 0;
        const percentage = usagePercentage(spent, allocation.amount);
        const barColor = usageColor(percentage, colors);
        const category = allocation.category;

        return (
          <View
            key={allocation.id}
            className="mb-3 rounded-2xl border p-3"
            style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
          >
            <View className="flex-row items-center">
              <View
                className="h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: (category?.color || colors.primary) + "18" }}
              >
                <Ionicons
                  name={(category?.icon as any) || "apps-outline"}
                  size={16}
                  color={category?.color || colors.primary}
                />
              </View>
              <ApText size="sm" font="semibold" color={colors.textPrimary} className="ml-2 flex-1">
                {category?.name || "Category"}
              </ApText>
              <ApText size="sm" font="bold" color={colors.textPrimary}>
                {helper.formatCurrency(allocation.amount)}
              </ApText>
            </View>
            <View className="mt-3">
              <ProgressBar percentage={percentage} color={barColor} />
            </View>
            <ApText size="xs" color={colors.textMuted} className="mt-2">
              {helper.formatCurrency(spent)} spent • {percentage}% of allocation
            </ApText>
          </View>
        );
      })}
      <View className="rounded-2xl p-3" style={{ backgroundColor: colors.surface }}>
        <Row label="Total allocated" value={helper.formatCurrency(allocated)} />
        <Row
          label="Unallocated"
          value={helper.formatCurrency(Math.max(budget.amount - allocated, 0))}
          color={colors.textMuted}
        />
      </View>
    </>
  );
};

const LinkedExpenses = ({ budget }: { budget: IBudget }) => {
  const colors = useTheme();
  const expenses = budget.expenses ?? [];

  return (
    <>
      <SectionTitle>Expenses ({expenses.length})</SectionTitle>
      {!expenses.length ? (
        <View className="rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}>
          <ApText size="sm" color={colors.textMuted}>
            No expenses linked to this budget yet.
          </ApText>
        </View>
      ) : (
        expenses.map((expense) => (
          <TouchableOpacity
            key={expense.id}
            onPress={() => router.push({ pathname: "/add-expense", params: { id: expense.id } })}
            className="mb-2 flex-row items-center rounded-2xl border p-3"
            style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
          >
            <View
              className="h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: (expense.category?.color || colors.primary) + "18" }}
            >
              <Ionicons
                name={(expense.category?.icon as any) || "receipt-outline"}
                size={16}
                color={expense.category?.color || colors.primary}
              />
            </View>
            <View className="ml-3 flex-1">
              <ApText size="sm" font="semibold" color={colors.textPrimary} numberOfLines={1}>
                {expense.title}
              </ApText>
              <ApText size="xs" color={colors.textMuted}>
                {expense.category?.name || "Uncategorized"} • {expense.expenseDate.slice(0, 10)}
              </ApText>
            </View>
            <ApText size="sm" font="bold" color={colors.warning}>
              {helper.formatCurrency(expense.amount)}
            </ApText>
          </TouchableOpacity>
        ))
      )}
    </>
  );
};

const BudgetDetailScreen = () => {
  const colors = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { budgets, fetchBudgets, deleteBudget, loading } = useBudgetState();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const budget = useMemo(() => budgets.find((item) => item.id === id), [budgets, id]);

  if (!budget) {
    // The list is still in flight on a cold open (e.g. a deep link).
    if (loading) return <ApLoader />;
    return (
      <ApContainer>
        <ApHeader title="Budget" hasBackButton />
        <ApEmptyState
          icon="wallet-outline"
          title="Budget not found"
          subtitle="It may have been deleted."
          actionLabel="Back to budgets"
          onAction={() => router.back()}
        />
      </ApContainer>
    );
  }

  const spent = budgetSpent(budget);
  const remaining = budget.remainingAmount ?? budget.amount - spent;
  const percentage = budget.utilisationPercentage ?? usagePercentage(spent, budget.amount);
  const barColor = usageColor(percentage, colors);
  const days = durationInDays(budget.startDate.slice(0, 10), budget.endDate.slice(0, 10));

  const confirmDelete = async () => {
    setConfirmingDelete(false);
    await deleteBudget(budget.id);
    router.back();
  };

  return (
    <ApContainer>
      <ApHeader
        title="Budget Details"
        hasBackButton
        right={
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/add-budget", params: { id: budget.id } })}
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.primary + "18" }}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setConfirmingDelete(true)}
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: DANGER + "18" }}
            >
              <Ionicons name="trash-outline" size={18} color={DANGER} />
            </TouchableOpacity>
          </View>
        }
      />
      <ApScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View
          className="mt-3 rounded-2xl border p-4"
          style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <ApText size="xl" font="bold" color={colors.textPrimary}>
                {budget.title}
              </ApText>
              <ApText size="xs" color={colors.textMuted} className="mt-1">
                {formatBudgetRange(budget.startDate, budget.endDate)} • {days}{" "}
                {days === 1 ? "day" : "days"}
              </ApText>
            </View>
            <View className="rounded-lg px-2 py-1" style={{ backgroundColor: colors.primary + "18" }}>
              <ApText size="xs" font="bold" color={colors.primary}>
                {PERIOD_LABELS[budget.periodType]}
              </ApText>
            </View>
          </View>

          <ApText size="xs" color={colors.textMuted} className="mt-2">
            {PERIOD_HELPERS[budget.periodType]}
          </ApText>

          <View className="mt-4">
            <ProgressBar percentage={percentage} color={barColor} />
          </View>
          <ApText size="xs" font="semibold" color={barColor} className="mt-2">
            {percentage}% used
          </ApText>

          <View className="mt-3">
            <Row label="Planned budget" value={helper.formatCurrency(budget.plannedAmount ?? budget.amount)} />
            <Row label="Budgeted expenses" value={helper.formatCurrency(spent)} color={colors.warning} />
            <Row
              label={remaining < 0 ? "Over budget by" : "Remaining budget"}
              value={helper.formatCurrency(Math.abs(remaining))}
              color={remaining < 0 ? DANGER : "#10B981"}
            />
            <Row label="Period income" value={helper.formatCurrency(budget.periodIncome ?? 0)} color={colors.primary} />
            <Row
              label="Period expenses"
              value={helper.formatCurrency(budget.totalPeriodExpenses ?? spent)}
              color={colors.warning}
            />
            <Row
              label="Period net cash flow"
              value={helper.formatCurrency(budget.netCashFlow ?? 0)}
              color={(budget.netCashFlow ?? 0) < 0 ? DANGER : "#10B981"}
            />
          </View>

          {percentage >= 80 ? (
            <View className="mt-3 flex-row items-start rounded-xl p-3" style={{ backgroundColor: DANGER + "18" }}>
              <Ionicons name="alert-circle-outline" size={18} color={DANGER} />
              <ApText size="sm" color={DANGER} className="ml-2 flex-1">
                {percentage >= 100
                  ? "You are above this budget."
                  : "You are close to this budget's limit."}
              </ApText>
            </View>
          ) : null}
        </View>

        {budget.note ? (
          <>
            <SectionTitle>Note</SectionTitle>
            <View
              className="rounded-2xl border p-4"
              style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
            >
              <ApText size="sm" color={colors.textSecondary}>
                {budget.note}
              </ApText>
            </View>
          </>
        ) : null}

        <WeeklyBreakdown budget={budget} />
        <CategoryAllocations budget={budget} />
        <LinkedExpenses budget={budget} />
      </ApScrollView>

      <ApConfirmModal
        visible={confirmingDelete}
        title="Delete budget?"
        subTitle={`"${budget.title}" and its breakdown will be removed. Linked expenses are kept.`}
        confirmText="Delete"
        destructive
        onConfirm={confirmDelete}
        onClose={() => setConfirmingDelete(false)}
      />
    </ApContainer>
  );
};

export default BudgetDetailScreen;
