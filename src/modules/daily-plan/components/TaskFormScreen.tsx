import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { X } from "lucide-react-native";
import {
  ApTextInput,
  ApTimeField,
  Button,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useDailyPlanState } from "../context";
import { useHabitState } from "@/src/modules/habits/context";
import { toDateKey } from "@/src/utils/date";
import { ToastService } from "@/src/services";

export const TaskFormScreen = () => {
  const colors = useTheme();
  const { planId, date } = useLocalSearchParams<{ planId?: string; date?: string }>();
  const selectedDate = date ?? toDateKey(new Date());

  const { selectedPlan, plans, createPlan, updatePlan, fetchPlans } = useDailyPlanState();
  const { habits, fetchHabits } = useHabitState();

  const plan = useMemo(
    () => plans.find((item) => item.id === planId) ?? selectedPlan ?? plans.find((item) => item.planDate?.startsWith(selectedDate)),
    [plans, selectedPlan, planId, selectedDate]
  );

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchPlans({ date: selectedDate }), fetchHabits()]);
  }, [selectedDate]);

  const handleSave = async () => {
    if (!taskTitle.trim()) {
      ToastService.Error("Please enter an activity title");
      return;
    }

    setSaving(true);
    try {
      const existingItems = (plan?.items ?? plan?.tasks ?? []) as any[];
      const newItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: taskTitle.trim(),
        description: taskDesc.trim() || undefined,
        startTime: startTime.trim() || undefined,
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        order: existingItems.length,
        status: "PENDING",
      };

      if (plan?.id) {
        await updatePlan(plan.id, {
          items: [...existingItems, newItem as any],
        });
      } else {
        await createPlan({
          planDate: selectedDate,
          title: "Daily Plan",
          items: [newItem as any],
        });
      }

      ToastService.Success("Activity added");
      router.back();
    } catch {
      ToastService.Error("Failed to save activity");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 justify-end bg-background">
      <View className="flex-1" style={{ backgroundColor: colors.overlay }}>
        <Pressable className="flex-1" onPress={() => router.back()} />

        <View
          className="bg-background-elevated rounded-t-2xl max-h-[90%] px-5 pt-3 pb-8"
          style={{
            flexShrink: 1,
            shadowColor: colors.inkPrimary,
            shadowOpacity: 0.16,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: -8 },
            elevation: 8,
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flexShrink: 1, maxHeight: "100%" }}
          >
            <View className="w-9 h-1 rounded-pill bg-border-strong self-center mb-3" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[18px] leading-[24px] font-semibold text-ink-primary">
                Add activity
              </Text>
              <Pressable
                onPress={() => router.back()}
                hitSlop={8}
                className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-70"
              >
                <X size={20} color={colors.inkPrimary} strokeWidth={2} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              style={{ flexShrink: 1 }}
            >
              <ApTextInput
                label="Activity title"
                placeholder="e.g. Morning run, Team standup, Deep work"
                value={taskTitle}
                onChangeText={setTaskTitle}
                containerClassName="mb-3"
              />

              <ApTextInput
                label="Details (optional)"
                placeholder="Notes or context..."
                value={taskDesc}
                onChangeText={setTaskDesc}
                containerClassName="mb-3"
              />

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <ApTimeField
                    label="Start time"
                    placeholder="09:00"
                    value={startTime}
                    onChange={setStartTime}
                  />
                </View>
                <View className="flex-1">
                  <ApTextInput
                    label="Duration (mins)"
                    placeholder="30"
                    value={durationMinutes}
                    onChangeText={setDurationMinutes}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View className="mt-3">
                <Button
                  label={saving ? "Saving..." : "Add activity"}
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

export default TaskFormScreen;
