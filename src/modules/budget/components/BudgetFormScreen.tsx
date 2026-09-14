import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
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
import { PERIOD_TYPES, PERIOD_LABELS } from "../utils";

export const BudgetFormScreen = () => {
  const colors = useTheme();
  const { createBudget } = useBudgetState();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [periodType, setPeriodType] = useState("MONTHLY");
  const [startDate, setStartDate] = useState(toDateKey(new Date()));
  const [endDate, setEndDate] = useState(toDateKey(new Date()));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      ToastService.Error("Please enter a budget name");
      return;
    }
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      ToastService.Error("Please enter a valid budget amount");
      return;
    }

    setSaving(true);
    try {
      await createBudget({
        title: title.trim(),
        amount: numAmount,
        periodType: periodType as any,
        startDate,
        endDate,
      });
      ToastService.Success("Budget created");
      router.back();
    } catch {
      ToastService.Error("Failed to create budget");
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
                New budget
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
                label="Budget name"
                placeholder="e.g. Monthly Living, Vacation, Weekly Fun"
                value={title}
                onChangeText={setTitle}
                containerClassName="mb-3"
              />

              <ApTextInput
                label="Total amount ($)"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                containerClassName="mb-3"
              />

              <Dropdown
                label="Period"
                options={PERIOD_TYPES.map((pt) => ({ label: PERIOD_LABELS[pt], value: pt }))}
                value={periodType}
                onChange={setPeriodType}
                className="mb-3"
              />

              <ApDateField
                label="Start date"
                value={startDate}
                onChange={setStartDate}
                className="mb-3"
              />

              <ApDateField
                label="End date"
                value={endDate}
                onChange={setEndDate}
                className="mb-4"
              />

              <View className="mt-2">
                <Button
                  label={saving ? "Creating..." : "Create budget"}
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

export default BudgetFormScreen;
