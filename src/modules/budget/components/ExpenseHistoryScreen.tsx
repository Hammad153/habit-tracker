import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApContainer, ApEmptyState, ApHeader, ApScrollView, ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useBudgetState } from "../context";
import helper from "@/src/helper";

const filters = [
  { label: "Day", days: 1 },
  { label: "Week", days: 7 },
  { label: "Month", days: 31 },
  { label: "All", days: 0 },
];

const ExpenseHistoryScreen = () => {
  const colors = useTheme();
  const { expenses, fetchExpenses, deleteExpense } = useBudgetState();
  const [activeFilter, setActiveFilter] = useState(filters[2]);

  const load = (days = activeFilter.days) => {
    if (!days) return fetchExpenses();
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    return fetchExpenses(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ApContainer>
      <ApHeader title="Expense History" hasBackButton />
      <ApScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="mt-3 flex-row gap-2">
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.label}
              onPress={() => {
                setActiveFilter(filter);
                load(filter.days);
              }}
              className="flex-1 rounded-xl py-2"
              style={{ backgroundColor: activeFilter.label === filter.label ? colors.primary : colors.surface }}
            >
              <ApText textAlign="center" size="xs" font="bold" color={activeFilter.label === filter.label ? colors.background : colors.textPrimary}>
                {filter.label}
              </ApText>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={() => router.push("/add-expense")} className="my-4 flex-row items-center justify-center rounded-2xl py-3" style={{ backgroundColor: colors.primary }}>
          <Ionicons name="add" size={18} color={colors.background} />
          <ApText size="sm" font="bold" color={colors.background} className="ml-2">
            Add Expense
          </ApText>
        </TouchableOpacity>
        {!expenses.length ? (
          <ApEmptyState icon="receipt-outline" title="No expenses found" subtitle="Try a wider filter or add your first expense." />
        ) : (
          expenses.map((expense) => (
            <View key={expense.id} className="mb-3 rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}>
              <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: (expense.category?.color || colors.primary) + "18" }}>
                  <Ionicons name={(expense.category?.icon as any) || "receipt-outline"} size={18} color={expense.category?.color || colors.primary} />
                </View>
                <View className="ml-3 flex-1">
                  <ApText size="sm" font="bold" color={colors.textPrimary}>
                    {expense.title}
                  </ApText>
                  <ApText size="xs" color={colors.textMuted}>
                    {expense.category?.name || "Uncategorized"} • {expense.expenseDate.slice(0, 10)}
                  </ApText>
                </View>
                <ApText size="sm" font="bold" color={colors.warning}>
                  {helper.formatCurrency(expense.amount)}
                </ApText>
              </View>
              <View className="mt-3 flex-row justify-end gap-2">
                <TouchableOpacity onPress={() => router.push({ pathname: "/add-expense", params: { id: expense.id } })} className="rounded-xl px-3 py-2" style={{ backgroundColor: colors.background }}>
                  <Ionicons name="create-outline" size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteExpense(expense.id)} className="rounded-xl px-3 py-2" style={{ backgroundColor: "#EF444418" }}>
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ApScrollView>
    </ApContainer>
  );
};

export default ExpenseHistoryScreen;
