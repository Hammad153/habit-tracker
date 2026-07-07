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
        className="rounded-2xl border px-4 py-3"
        style={{ color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.surfaceBorder, minHeight: multiline ? 88 : undefined }}
      />
    </View>
  );
};

const IncomeFormScreen = () => {
  const colors = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { incomes, createIncome, updateIncome, loading, fetchIncomes } = useBudgetState();
  const editing = useMemo(() => incomes.find((item) => item.id === id), [incomes, id]);
  const [title, setTitle] = useState(editing?.title ?? "");
  const [amount, setAmount] = useState(editing?.amount ? String(editing.amount) : "");
  const [incomeDate, setIncomeDate] = useState(editing?.incomeDate?.slice(0, 10) ?? toDateKey(new Date()));
  const [note, setNote] = useState(editing?.note ?? "");

  useEffect(() => {
    fetchIncomes();
  }, []);

  useEffect(() => {
    if (!editing) return;
    setTitle(editing.title);
    setAmount(String(editing.amount));
    setIncomeDate(editing.incomeDate.slice(0, 10));
    setNote(editing.note ?? "");
  }, [editing?.id]);

  const canSave = title.trim().length > 0 && Number(amount) > 0;

  const submit = async () => {
    if (!canSave) return;
    const payload = { title: title.trim(), amount: Number(amount), incomeDate, note: note.trim() || undefined };
    if (editing) {
      await updateIncome(editing.id, payload);
    } else {
      await createIncome(payload);
    }
    router.back();
  };

  return (
    <ApContainer>
      <ApHeader title={editing ? "Edit Income" : "Add Income"} hasBackButton />
      <ApScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View className="mt-4 px-1">
          <Field label="Title" value={title} onChangeText={setTitle} />
          <Field label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <Field label="Date (YYYY-MM-DD)" value={incomeDate} onChangeText={setIncomeDate} />
          <Field label="Note" value={note} onChangeText={setNote} multiline />
          <TouchableOpacity disabled={!canSave || loading} onPress={submit} className="mt-2 flex-row items-center justify-center rounded-2xl py-4" style={{ backgroundColor: canSave ? colors.primary : colors.surfaceBorder }}>
            <Ionicons name="save-outline" size={18} color={colors.background} />
            <ApText size="base" font="bold" color={colors.background} className="ml-2">
              Save Income
            </ApText>
          </TouchableOpacity>
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default IncomeFormScreen;
