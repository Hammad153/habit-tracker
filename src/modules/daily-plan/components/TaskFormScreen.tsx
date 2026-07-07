import React, { useEffect, useMemo, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ApContainer, ApHeader, ApScrollView, ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useDailyPlanState } from "../context";
import { useHabitState } from "@/src/modules/habits/context";

const Field = ({ label, value, onChangeText, multiline = false }: any) => {
  const colors = useTheme();
  return (
    <View className="mb-4">
      <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 uppercase">
        {label}
      </ApText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        className="rounded-2xl border px-4 py-3"
        style={{ color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.surfaceBorder, minHeight: multiline ? 88 : undefined }}
      />
    </View>
  );
};

const priorities = ["HIGH", "MEDIUM", "LOW"] as const;

const TaskFormScreen = () => {
  const colors = useTheme();
  const { id, planId } = useLocalSearchParams<{ id?: string; planId?: string; date?: string }>();
  const { selectedPlan, plans, createTask, updateTask, loading, fetchPlans } = useDailyPlanState();
  const { habits, fetchHabits } = useHabitState();
  const plan = selectedPlan ?? plans[0];
  const editing = useMemo(() => plan?.tasks?.find((task) => task.id === id), [plan?.tasks, id]);
  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [priority, setPriority] = useState(editing?.priority ?? "MEDIUM");
  const [startTime, setStartTime] = useState(editing?.startTime ?? "");
  const [endTime, setEndTime] = useState(editing?.endTime ?? "");
  const [habitId, setHabitId] = useState(editing?.habitId ?? "");

  useEffect(() => {
    Promise.all([fetchPlans(), fetchHabits()]);
  }, []);

  useEffect(() => {
    if (!editing) return;
    setTitle(editing.title);
    setDescription(editing.description ?? "");
    setPriority(editing.priority);
    setStartTime(editing.startTime ?? "");
    setEndTime(editing.endTime ?? "");
    setHabitId(editing.habitId ?? "");
  }, [editing?.id]);

  const canSave = title.trim().length > 0 && (planId || editing?.dailyPlanId || plan?.id);

  const submit = async () => {
    if (!canSave) return;
    const payload = {
      dailyPlanId: editing?.dailyPlanId ?? planId ?? plan?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      startTime: startTime.trim() || undefined,
      endTime: endTime.trim() || undefined,
      habitId: habitId || undefined,
    };
    if (editing) {
      await updateTask(editing.id, payload);
    } else {
      await createTask(payload);
    }
    router.back();
  };

  return (
    <ApContainer>
      <ApHeader title={editing ? "Edit Task" : "Add Task"} hasBackButton />
      <ApScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View className="mt-4 px-1">
          <Field label="Task title" value={title} onChangeText={setTitle} />
          <Field label="Description" value={description} onChangeText={setDescription} multiline />
          <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 uppercase">
            Priority
          </ApText>
          <View className="mb-4 flex-row gap-2">
            {priorities.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setPriority(item)}
                className="flex-1 rounded-xl py-3"
                style={{ backgroundColor: priority === item ? colors.primary : colors.surface }}
              >
                <ApText size="xs" font="bold" textAlign="center" color={priority === item ? colors.background : colors.textPrimary}>
                  {item}
                </ApText>
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Field label="Start time" value={startTime} onChangeText={setStartTime} />
            </View>
            <View className="flex-1">
              <Field label="End time" value={endTime} onChangeText={setEndTime} />
            </View>
          </View>
          <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 uppercase">
            Link Habit
          </ApText>
          <View className="mb-4 flex-row flex-wrap gap-2">
            <TouchableOpacity onPress={() => setHabitId("")} className="rounded-xl px-3 py-2" style={{ backgroundColor: !habitId ? colors.primary : colors.surface }}>
              <ApText size="xs" font="bold" color={!habitId ? colors.background : colors.textPrimary}>
                None
              </ApText>
            </TouchableOpacity>
            {habits.filter((habit) => !habit.isArchived).map((habit) => (
              <TouchableOpacity key={habit.id} onPress={() => setHabitId(habit.id)} className="rounded-xl px-3 py-2" style={{ backgroundColor: habitId === habit.id ? colors.primary : colors.surface }}>
                <ApText size="xs" font="bold" color={habitId === habit.id ? colors.background : colors.textPrimary}>
                  {habit.title}
                </ApText>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity disabled={!canSave || loading} onPress={submit} className="mt-2 flex-row items-center justify-center rounded-2xl py-4" style={{ backgroundColor: canSave ? colors.primary : colors.surfaceBorder }}>
            <Ionicons name="save-outline" size={18} color={colors.background} />
            <ApText size="base" font="bold" color={colors.background} className="ml-2">
              Save Task
            </ApText>
          </TouchableOpacity>
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default TaskFormScreen;
