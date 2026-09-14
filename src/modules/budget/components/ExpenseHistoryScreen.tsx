import React, { useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import {
  ApHeader,
  ApEmptyState,
  SkeletonHabitList,
} from "@/src/components";
import { ListRow } from "@/src/components/ListRow";
import { useTheme } from "@/src/modules/settings/context";
import { useBudgetState } from "../context";
import { DollarSign } from "lucide-react-native";

export const ExpenseHistoryScreen = () => {
  const colors = useTheme();
  const { expenses, fetchExpenses, loading } = useBudgetState();

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <View className="flex-1 bg-background">
      <ApHeader title="Expense history" hasBackButton />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 }}
      >
        {loading && (!expenses || expenses.length === 0) ? (
          <SkeletonHabitList count={5} />
        ) : (!expenses || expenses.length === 0) ? (
          <ApEmptyState
            title="No expenses recorded"
            description="Log your daily expenses to see history here."
          />
        ) : (
          <View className="bg-background-surface rounded-lg px-4 py-1">
            {expenses.map((exp: any, index: number) => (
              <ListRow
                key={exp.id}
                title={exp.description || exp.category?.name || "Expense"}
                subLabel={exp.expenseDate ? exp.expenseDate.slice(0, 10) : ""}
                icon={DollarSign}
                iconBg={colors.backgroundSurface2}
                iconColor={colors.inkSecondary}
                trailingControl={
                  <Text className="text-[15px] font-bold text-danger">
                    -${exp.amount.toLocaleString()}
                  </Text>
                }
                isLast={index === expenses.length - 1}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ExpenseHistoryScreen;
