import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { X } from "lucide-react-native";
import {
  ApTextInput,
  Button,
  Dropdown,
  ApDateField,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useBudgetState } from "../context";
import { toDateKey } from "@/src/utils/date";
import { ToastService } from "@/src/services";

export const ExpenseFormScreen = () => {
  const colors = useTheme();
  const params = useLocalSearchParams<{ budgetId?: string }>();
  const { categories, createExpense, budgets } = useBudgetState();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [selectedBudgetId, setSelectedBudgetId] = useState(params.budgetId || "");
  const [date, setDate] = useState(toDateKey(new Date()));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      ToastService.Error("Please enter a valid amount");
      return;
    }

    setSaving(true);
    try {
      await createExpense({
        amount: numAmount,
        note: description.trim() || undefined,
        categoryId: categoryId || undefined,
        budgetId: selectedBudgetId || undefined,
        expenseDate: date,
      });
      ToastService.Success("Expense recorded");
      router.back();
    } catch {
      ToastService.Error("Failed to record expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 justify-end bg-background">
      <View className="flex-1" style={{ backgroundColor: colors.overlay }}>
        <Pressable className="flex-1" onPress={() => router.back()} />

        <View
          className="bg-background-elevated rounded-t-xl max-h-[90%] px-5 pt-3 pb-8"
          style={{
            shadowColor: colors.inkPrimary,
            shadowOpacity: 0.16,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: -8 },
            elevation: 8,
          }}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View className="w-9 h-1 rounded-pill bg-border-strong self-center mb-3" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[18px] leading-[24px] font-semibold text-ink-primary">
                Add expense
              </Text>
              <Pressable
                onPress={() => router.back()}
                hitSlop={8}
                className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-70"
              >
                <X size={20} color={colors.inkPrimary} strokeWidth={2} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              <ApTextInput
                label="Amount ($)"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                containerClassName="mb-3"
              />

              <ApTextInput
                label="Description"
                placeholder="e.g. Groceries, Coffee, Utilities"
                value={description}
                onChangeText={setDescription}
                containerClassName="mb-3"
              />

              {categories.length > 0 && (
                <Dropdown
                  label="Category"
                  options={categories.map((c) => ({ label: c.name, value: c.id }))}
                  value={categoryId}
                  onChange={setCategoryId}
                  className="mb-3"
                />
              )}

              {budgets.length > 0 && (
                <Dropdown
                  label="Link to budget (optional)"
                  options={[
                    { label: "None", value: "" },
                    ...budgets.map((b) => ({ label: b.title, value: b.id })),
                  ]}
                  value={selectedBudgetId}
                  onChange={setSelectedBudgetId}
                  className="mb-3"
                />
              )}

              <ApDateField
                label="Date"
                value={date}
                onChange={setDate}
                className="mb-4"
              />

              <View className="mt-2">
                <Button
                  label={saving ? "Recording..." : "Record expense"}
                  onPress={handleSave}
                  loading={saving}
                  variant="primary"
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </View>
  );
};

export default ExpenseFormScreen;
