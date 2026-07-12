import React, { useEffect, useMemo, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ApContainer,
  ApDateField,
  ApHeader,
  ApScrollView,
  ApSubmitButton,
  ApText,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { toDateKey } from "@/src/utils/date";
import { useBudgetState } from "../context";
import { formatBudgetRange, parseDateKey } from "../utils";

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
    fetchBudgets,
    ensureCategories,
    fetchExpenses,
  } = useBudgetState();
  const editing = useMemo(() => expenses.find((item) => item.id === id), [expenses, id]);
  // The context's `loading` is shared by every budget request, so the button
  // tracks this request on its own.
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState(editing?.title ?? "");
  const [amount, setAmount] = useState(editing?.amount ? String(editing.amount) : "");
  const [expenseDate, setExpenseDate] = useState(editing?.expenseDate?.slice(0, 10) ?? toDateKey(new Date()));
  const [note, setNote] = useState(editing?.note ?? "");
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "");
  const [budgetId, setBudgetId] = useState(editing?.budgetId ?? "");

  useEffect(() => {
    Promise.all([ensureCategories(), fetchBudgets(), fetchExpenses()]);
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

  const matchingBudgets = useMemo(() => {
    const date = parseDateKey(expenseDate);
    return budgets.filter((budget) => {
      const start = parseDateKey(budget.startDate);
      const end = parseDateKey(budget.endDate);
      return date >= start && date <= end;
    });
  }, [budgets, expenseDate]);

  useEffect(() => {
    if (!matchingBudgets.length) {
      setBudgetId("");
      return;
    }

    const stillValid = matchingBudgets.some((budget) => budget.id === budgetId);
    if (stillValid) return;

    const sorted = [...matchingBudgets].sort((a, b) => {
      const aDays =
        parseDateKey(a.endDate).getTime() - parseDateKey(a.startDate).getTime();
      const bDays =
        parseDateKey(b.endDate).getTime() - parseDateKey(b.startDate).getTime();
      if (aDays !== bDays) return aDays - bDays;
      return a.createdAt.localeCompare(b.createdAt);
    });
    setBudgetId(sorted[0]?.id ?? "");
  }, [matchingBudgets, budgetId]);

  const canSave = title.trim().length > 0 && Number(amount) > 0 && categoryId;

  const submit = async () => {
    if (!canSave || submitting) return;
    const payload = {
      title: title.trim(),
      amount: Number(amount),
      expenseDate,
      note: note.trim() || undefined,
      categoryId,
      budgetId: budgetId || undefined,
    };
    setSubmitting(true);
    try {
      const saved = editing
        ? await updateExpense(editing.id, payload)
        : await createExpense(payload);
      // Stay on the screen if the request failed, so nothing typed is lost.
      if (saved) router.back();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ApContainer>
      <ApHeader title={editing ? "Edit Expense" : "Add Expense"} hasBackButton />
      <ApScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View className="mt-4 px-1">
          <Field label="Title" value={title} onChangeText={setTitle} />
          <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <ApDateField label="Date" value={expenseDate} onChange={setExpenseDate} />
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
                Unbudgeted expense
              </ApText>
            </TouchableOpacity>
            {matchingBudgets.map((budget) => (
              <TouchableOpacity key={budget.id} onPress={() => setBudgetId(budget.id)} className="rounded-xl px-3 py-2" style={{ backgroundColor: budgetId === budget.id ? colors.primary : colors.surface }}>
                <ApText size="xs" font="bold" color={budgetId === budget.id ? colors.background : colors.textPrimary}>
                  {budget.title}
                </ApText>
                <ApText size="xs" color={budgetId === budget.id ? colors.background : colors.textMuted}>
                  {formatBudgetRange(budget.startDate, budget.endDate)}
                </ApText>
              </TouchableOpacity>
            ))}
          </View>
          {!matchingBudgets.length ? (
            <View className="mb-4 rounded-2xl border p-3" style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}>
              <ApText size="sm" color={colors.textMuted}>
                No budget covers this expense date.
              </ApText>
            </View>
          ) : null}
          <Field label="Note" value={note} onChangeText={setNote} multiline />
          <ApSubmitButton
            label="Save Expense"
            loadingLabel="Saving expense..."
            onPress={submit}
            loading={submitting}
            enabled={!!canSave}
          />
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default ExpenseFormScreen;
