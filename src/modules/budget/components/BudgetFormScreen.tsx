import React, { useEffect, useMemo, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ApContainer, ApHeader, ApScrollView, ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { toDateKey } from "@/src/utils/date";
import { useBudgetState } from "../context";

const Field = ({ label, value, onChangeText, keyboardType = "default" }: any) => {
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
        placeholderTextColor={colors.textMuted}
        className="rounded-2xl border px-4 py-3"
        style={{ color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
      />
    </View>
  );
};

const periodTypes = ["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"] as const;

const BudgetFormScreen = () => {
  const colors = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { budgets, createBudget, updateBudget, loading, fetchBudgets } = useBudgetState();
  const editing = useMemo(() => budgets.find((item) => item.id === id), [budgets, id]);
  const now = new Date();
  const monthStart = toDateKey(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = toDateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const [title, setTitle] = useState(editing?.title ?? "");
  const [amount, setAmount] = useState(editing?.amount ? String(editing.amount) : "");
  const [periodType, setPeriodType] = useState(editing?.periodType ?? "MONTHLY");
  const [startDate, setStartDate] = useState(editing?.startDate?.slice(0, 10) ?? monthStart);
  const [endDate, setEndDate] = useState(editing?.endDate?.slice(0, 10) ?? monthEnd);

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    if (!editing) return;
    setTitle(editing.title);
    setAmount(String(editing.amount));
    setPeriodType(editing.periodType);
    setStartDate(editing.startDate.slice(0, 10));
    setEndDate(editing.endDate.slice(0, 10));
  }, [editing?.id]);

  const canSave = title.trim().length > 0 && Number(amount) > 0;

  const submit = async () => {
    if (!canSave) return;
    const payload = { title: title.trim(), amount: Number(amount), periodType, startDate, endDate };
    if (editing) {
      await updateBudget(editing.id, payload);
    } else {
      await createBudget(payload);
    }
    router.back();
  };

  return (
    <ApContainer>
      <ApHeader title={editing ? "Edit Budget" : "Add Budget"} hasBackButton />
      <ApScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="mt-4 px-1">
          <Field label="Title" value={title} onChangeText={setTitle} />
          <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 uppercase">
            Period
          </ApText>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {periodTypes.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setPeriodType(type)}
                className="rounded-xl px-3 py-2"
                style={{ backgroundColor: periodType === type ? colors.primary : colors.surface }}
              >
                <ApText size="xs" font="bold" color={periodType === type ? colors.background : colors.textPrimary}>
                  {type}
                </ApText>
              </TouchableOpacity>
            ))}
          </View>
          <Field label="Start date (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} />
          <Field label="End date (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} />
          <TouchableOpacity
            disabled={!canSave || loading}
            onPress={submit}
            className="mt-2 flex-row items-center justify-center rounded-2xl py-4"
            style={{ backgroundColor: canSave ? colors.primary : colors.surfaceBorder }}
          >
            <Ionicons name="save-outline" size={18} color={colors.background} />
            <ApText size="base" font="bold" color={colors.background} className="ml-2">
              Save Budget
            </ApText>
          </TouchableOpacity>
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default BudgetFormScreen;
