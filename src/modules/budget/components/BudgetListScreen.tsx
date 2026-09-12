import React, { useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { Plus, ChevronRight, DollarSign } from "lucide-react-native";
import {
  ApHeader,
  ApEmptyState,
  SkeletonHabitList,
} from "@/src/components";
import { ListRow } from "@/src/components/ListRow";
import { useTheme } from "@/src/modules/settings/context";
import { useBudgetState } from "../context";

export const BudgetListScreen = () => {
  const colors = useTheme();
  const { loading, budgets, fetchBudgets } = useBudgetState();

  useEffect(() => {
    fetchBudgets();
  }, []);

  return (
    <View className="flex-1 bg-background">
      <ApHeader
        title="Budgets"
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
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 }}
      >
        {loading && budgets.length === 0 ? (
          <SkeletonHabitList count={4} />
        ) : budgets.length === 0 ? (
          <ApEmptyState
            title="No budgets yet"
            description="Create your first budget to start tracking your spending."
            actionLabel="Create budget"
            onAction={() => router.push("/add-budget")}
          />
        ) : (
          <View className="bg-background-surface rounded-lg px-4 py-1">
            {budgets.map((b, index) => {
              const spent = b.budgetedExpenseTotal ?? 0;
              return (
                <ListRow
                  key={b.id}
                  title={b.title || "Budget"}
                  subLabel={`$${spent.toLocaleString()} spent of $${b.amount.toLocaleString()}`}
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
                  isLast={index === budgets.length - 1}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default BudgetListScreen;
