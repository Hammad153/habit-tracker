import React, { useEffect, useMemo, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ApContainer, ApHeader, ApScrollView, ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { toDateKey } from "@/src/utils/date";
import { useBudgetState } from "../context";

const Field = ({ label, value, onChangeText, keyboardType = "default", multiline = false }: any) => {
  const colors = useTheme();
  return (
    <View className="mb-4">
      <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 uppercase">
        {label}
      </ApText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholderTextColor={colors.textMuted}
        className="rounded-2xl border px-4 py-3"
        style={{ color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.surfaceBorder, minHeight: multiline ? 88 : undefined }}
      />
    </View>
  );
};

const ExpenseFormScreen = () => {
  const colors = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const {
    budgets,
    categories,
    expenses,
    createExpense,
    updateExpense,
    loading,
    fetchBudgets,
    fetchCategories,
    fetchExpenses,
  } = useBudgetState();
  const editing = useMemo(() => expenses.find((item) => item.id === id), [expenses, id]);
  const [title, setTitle] = useState(editing?.title ?? "");
  const [amount, setAmount] = useState(editing?.amount ? String(editing.amount) : "");
  const [expenseDate, setExpenseDate] = useState(editing?.expenseDate?.slice(0, 10) ?? toDateKey(new Date()));
  const [note, setNote] = useState(editing?.note ?? "");
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "");
  const [budgetId, setBudgetId] = useState(editing?.budgetId ?? "");

  useEffect(() => {
    Promise.all([fetchCategories(), fetchBudgets(), fetchExpenses()]);
  }, []);

  useEffect(() => {
    if (!categoryId && categories[0]) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  useEffect(() => {
    if (!editing) return;
    setTitle(editing.title);
    setAmount(String(editing.amount));
    setExpenseDate(editing.expenseDate.slice(0, 10));
    setNote(editing.note ?? "");
    setCategoryId(editing.categoryId);
    setBudgetId(editing.budgetId ?? "");
  }, [editing?.id]);

  const canSave = title.trim().length > 0 && Number(amount) > 0 && categoryId;

  const submit = async () => {
    if (!canSave) return;
    const payload = {
      title: title.trim(),
      amount: Number(amount),
      expenseDate,
      note: note.trim() || undefined,
      categoryId,
      budgetId: budgetId || undefined,
    };
    if (editing) {
      await updateExpense(editing.id, payload);
    } else {
      await createExpense(payload);
    }
    router.back();
  };

  return (
    <ApContainer>
      <ApHeader title={editing ? "Edit Expense" : "Add Expense"} hasBackButton />
      <ApScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View className="mt-4 px-1">
          <Field label="Title" value={title} onChangeText={setTitle} />
          <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 uppercase">
            Category
          </ApText>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setCategoryId(category.id)}
                className="flex-row items-center rounded-xl px-3 py-2"
                style={{ backgroundColor: categoryId === category.id ? colors.primary : colors.surface }}
              >
                <Ionicons name={(category.icon as any) || "apps-outline"} size={14} color={categoryId === category.id ? colors.background : category.color || colors.primary} />
                <ApText size="xs" font="bold" color={categoryId === category.id ? colors.background : colors.textPrimary} className="ml-1">
                  {category.name}
                </ApText>
              </TouchableOpacity>
            ))}
          </View>
          <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 uppercase">
            Budget
          </ApText>
          <View className="mb-4 flex-row flex-wrap gap-2">
            <TouchableOpacity onPress={() => setBudgetId("")} className="rounded-xl px-3 py-2" style={{ backgroundColor: !budgetId ? colors.primary : colors.surface }}>
              <ApText size="xs" font="bold" color={!budgetId ? colors.background : colors.textPrimary}>
                None
              </ApText>
            </TouchableOpacity>
            {budgets.map((budget) => (
              <TouchableOpacity key={budget.id} onPress={() => setBudgetId(budget.id)} className="rounded-xl px-3 py-2" style={{ backgroundColor: budgetId === budget.id ? colors.primary : colors.surface }}>
                <ApText size="xs" font="bold" color={budgetId === budget.id ? colors.background : colors.textPrimary}>
                  {budget.title}
                </ApText>
              </TouchableOpacity>
            ))}
          </View>
          <Field label="Date (YYYY-MM-DD)" value={expenseDate} onChangeText={setExpenseDate} />
          <Field label="Note" value={note} onChangeText={setNote} multiline />
          <TouchableOpacity disabled={!canSave || loading} onPress={submit} className="mt-2 flex-row items-center justify-center rounded-2xl py-4" style={{ backgroundColor: canSave ? colors.primary : colors.surfaceBorder }}>
            <Ionicons name="save-outline" size={18} color={colors.background} />
            <ApText size="base" font="bold" color={colors.background} className="ml-2">
              Save Expense
            </ApText>
          </TouchableOpacity>
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default ExpenseFormScreen;
