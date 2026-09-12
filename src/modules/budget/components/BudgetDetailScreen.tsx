import React, { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, DollarSign, Plus, ChevronRight } from "lucide-react-native";
import {
  ApErrorState,
  Skeleton,
  SkeletonCard,
  SkeletonStatRow,
  SkeletonHabitList,
} from "@/src/components";
import { Card } from "@/src/components/Card";
import { ProgressBar } from "@/src/components/ProgressBar";
import { ListRow } from "@/src/components/ListRow";
import { Button } from "@/src/components/buttons/Button";
import { useTheme } from "@/src/modules/settings/context";
import { useBudgetState } from "../context";
import { formatBudgetRange, budgetSpent } from "../utils";

export const BudgetDetailScreen = () => {
  const colors = useTheme();
  const { budgetId } = useLocalSearchParams<{ budgetId: string }>();
  const { budgets, fetchBudgets, loading } = useBudgetState();

  useEffect(() => {
    fetchBudgets();
  }, []);

  const budget = useMemo(
    () => budgets.find((b) => b.id === budgetId),
    [budgets, budgetId]
  );

  if (loading && !budget) {
    return (
      <View className="flex-1 bg-background">
        <View className="h-[56px] px-5 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
          >
            <ArrowLeft size={20} color={colors.inkPrimary} strokeWidth={2} />
          </Pressable>
          <Text className="text-[18px] font-bold text-ink-primary">
            Budget details
          </Text>
          <View className="w-10" />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 }}
        >
          <SkeletonCard height={80} className="my-3" />
          <SkeletonStatRow className="my-4" />
          <Skeleton height={6} radius={3} className="my-3" />
          <SkeletonHabitList count={3} />
        </ScrollView>
      </View>
    );
  }

  if (!budget) {
    return (
      <View className="flex-1 bg-background">
        <ApErrorState onRetry={fetchBudgets} />
      </View>
    );
  }

  const spent = budgetSpent(budget);
  const total = budget.amount || 1;
  const remaining = total - spent;
  const pct = Math.min(1, spent / total);
  const rangeText = formatBudgetRange(budget.startDate, budget.endDate);

  return (
    <View className="flex-1 bg-background">
      {/* Top Navbar */}
      <View className="h-[56px] px-5 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
        >
          <ArrowLeft size={20} color={colors.inkPrimary} strokeWidth={2} />
        </Pressable>
        <Text className="text-[18px] font-bold text-ink-primary">
          Budget details
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="my-3">
          <Text className="text-[22px] font-bold text-ink-primary">
            {budget.title}
          </Text>
          <Text className="text-[12.5px] font-medium text-ink-secondary mt-0.5">
            {rangeText} · {budget.periodType}
          </Text>
        </View>

        {/* Plain Stats Numbers (Section 4) */}
        <View className="flex-row items-center justify-between my-4">
          <View>
            <Text className="text-[24px] font-bold text-ink-primary">
              ${total.toLocaleString()}
            </Text>
            <Text className="text-[11.5px] font-medium text-ink-secondary mt-0.5">
              Limit
            </Text>
          </View>
          <View>
            <Text className="text-[24px] font-bold text-ink-primary">
              ${spent.toLocaleString()}
            </Text>
            <Text className="text-[11.5px] font-medium text-ink-secondary mt-0.5">
              Spent
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

        <ProgressBar
          progress={pct}
          tone={pct >= 1 ? "danger" : pct >= 0.8 ? "warning" : "accent"}
          height={6}
          className="my-3"
        />

        <View className="h-[1px] bg-border my-2" />

        {/* Linked Expenses */}
        <Text className="text-[12px] font-semibold text-ink-tertiary mt-4 mb-2">
          Expenses on this budget
        </Text>
        {(!budget.expenses || budget.expenses.length === 0) ? (
          <Text className="text-[13.5px] text-ink-secondary my-4">
            No expenses linked to this budget yet.
          </Text>
        ) : (
          <View className="bg-background-surface rounded-lg px-4 py-1 mb-4">
            {budget.expenses.map((exp: any, idx: number) => (
              <ListRow
                key={exp.id}
                title={exp.description || exp.category?.name || "Expense"}
                subLabel={exp.expenseDate ? exp.expenseDate.slice(0, 10) : ""}
                trailingControl={
                  <Text className="text-[15px] font-bold text-ink-primary">
                    -${exp.amount.toLocaleString()}
                  </Text>
                }
                isLast={idx === (budget.expenses?.length ?? 0) - 1}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Pinned Bottom Button */}
      <View
        className="absolute bottom-0 left-0 right-0 p-5 bg-background border-t border-border"
        style={{ paddingBottom: 24 }}
      >
        <Button
          label="Add expense to this budget"
          onPress={() =>
            router.push({
              pathname: "/add-expense",
              params: { budgetId: budget.id },
            })
          }
          variant="primary"
        />
      </View>
    </View>
  );
};

export default BudgetDetailScreen;
