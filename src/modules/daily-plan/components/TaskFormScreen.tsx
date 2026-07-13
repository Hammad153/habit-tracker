import React, { useEffect, useMemo, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ApContainer, ApHeader, ApScrollView, ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useDailyPlanState } from "../context";
import { useHabitState } from "@/src/modules/habits/context";
import { IDailyPlanTask } from "../model";
import { toDateKey } from "@/src/utils/date";

type DraftActivity = Partial<IDailyPlanTask> & { localId: string; durationText?: string; showHabitPicker?: boolean };

const timeToMinutes = (value?: string) => {
  if (!value) return undefined;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return undefined;
  return Number(match[1]) * 60 + Number(match[2]);
};

const minutesToTime = (value: number) => {
  const hours = Math.floor(Math.max(0, Math.min(value, 1439)) / 60);
  const minutes = Math.max(0, Math.min(value, 1439)) % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const formatDuration = (minutes?: number) => {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours} hours`;
};

const Field = ({ label, value, onChangeText, multiline = false, placeholder, keyboardType }: any) => {
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
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        className="rounded-2xl border px-4 py-3"
        style={{ color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.surfaceBorder, minHeight: multiline ? 88 : undefined }}
      />
    </View>
  );
};

const normalizeDraft = (item: DraftActivity, index: number) => {
  const start = timeToMinutes(item.startTime);
  const end = timeToMinutes(item.endTime);
  const duration = item.durationText ? Number(item.durationText) : item.durationMinutes;
  let endTime = item.endTime?.trim() || undefined;
  let durationMinutes = Number.isFinite(duration) ? duration : undefined;

  if (start !== undefined && durationMinutes && !endTime) endTime = minutesToTime(start + durationMinutes);
  if (start !== undefined && end !== undefined && !durationMinutes) durationMinutes = end - start;

  return {
    id: item.id,
    title: item.title?.trim(),
    description: item.description?.trim() || undefined,
    startTime: item.startTime?.trim() || undefined,
    endTime,
    durationMinutes,
    linkedHabitId: item.linkedHabitId || item.habitId || undefined,
    order: index,
    sortOrder: index,
    status: item.status ?? "PENDING",
  };
};

const TaskFormScreen = () => {
  const colors = useTheme();
  const { planId, date } = useLocalSearchParams<{ planId?: string; date?: string }>();
  const selectedDate = date ?? toDateKey(new Date());
  const { selectedPlan, plans, createPlan, updatePlan, loading, fetchPlans } = useDailyPlanState();
  const { habits, fetchHabits } = useHabitState();
  const plan = useMemo(
    () => plans.find((item) => item.id === planId) ?? selectedPlan ?? plans.find((item) => item.planDate?.startsWith(selectedDate)),
    [plans, selectedPlan, planId, selectedDate],
  );
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<DraftActivity[]>([]);

  useEffect(() => {
    Promise.all([fetchPlans({ date: selectedDate }), fetchHabits()]);
  }, [selectedDate]);

  useEffect(() => {
    setTitle(plan?.title ?? (selectedDate === toDateKey(new Date()) ? "Today's Plan" : "Daily Plan"));
    setNote(plan?.note ?? "");
    const source = plan?.items ?? plan?.tasks ?? [];
    setItems(
      source.length
        ? source.map((item, index) => ({
            ...item,
            linkedHabitId: item.linkedHabitId ?? item.habitId,
            localId: item.id ?? `${Date.now()}-${index}`,
            durationText: item.durationMinutes ? String(item.durationMinutes) : "",
          }))
        : [
            {
              localId: `${Date.now()}`,
              title: "",
              startTime: "",
              endTime: "",
              durationText: "",
              status: "PENDING",
              sortOrder: 0,
            },
          ],
    );
  }, [plan?.id]);

  const updateItem = (localId: string, patch: Partial<DraftActivity>) => {
    setItems((current) =>
      current.map((item) => {
        if (item.localId !== localId) return item;
        const next = { ...item, ...patch };
        if (patch.durationText !== undefined && next.startTime && !patch.endTime) {
          const start = timeToMinutes(next.startTime);
          const duration = Number(patch.durationText);
          if (start !== undefined && Number.isFinite(duration) && duration > 0) next.endTime = minutesToTime(start + duration);
        }
        if (patch.endTime !== undefined && next.startTime) {
          const start = timeToMinutes(next.startTime);
          const end = timeToMinutes(patch.endTime);
          if (start !== undefined && end !== undefined && end > start) next.durationText = String(end - start);
        }
        return next;
      }),
    );
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    setItems((current) => {
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  };

  const addActivity = () => {
    setItems((current) => [
      ...current,
      {
        localId: `${Date.now()}`,
        title: "",
        startTime: "",
        endTime: "",
        durationText: "",
        status: "PENDING",
        sortOrder: current.length,
      },
    ]);
  };

  const removeActivity = (localId: string) => {
    setItems((current) => current.filter((item) => item.localId !== localId));
  };

  const save = async () => {
    const normalized = items.map(normalizeDraft).filter((item) => item.title);
    if (plan?.id) {
      await updatePlan(plan.id, { title: title.trim() || undefined, note: note.trim() || undefined, planDate: selectedDate, items: normalized } as any);
    } else {
      await createPlan({ title: title.trim() || undefined, note: note.trim() || undefined, planDate: selectedDate, items: normalized } as any);
    }
    router.back();
  };

  const invalid = items.some((item) => {
    const normalized = normalizeDraft(item, 0);
    if (!normalized.title) return false;
    if (normalized.durationMinutes !== undefined && normalized.durationMinutes <= 0) return true;
    const start = timeToMinutes(normalized.startTime);
    const end = timeToMinutes(normalized.endTime);
    return start !== undefined && end !== undefined && end < start;
  });

  return (
    <ApContainer>
      <ApHeader title="Plan Roadmap" hasBackButton />
      <ApScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View className="mt-4 px-1">
          <Field label="Plan title" value={title} onChangeText={setTitle} placeholder="Daily Plan" />
          <Field label="Plan note" value={note} onChangeText={setNote} placeholder="What should this day protect?" multiline />

          <View className="mb-3 flex-row items-center justify-between">
            <ApText size="lg" font="bold" color={colors.textPrimary}>
              Activities
            </ApText>
            <TouchableOpacity onPress={addActivity} className="flex-row items-center rounded-2xl px-3 py-2" style={{ backgroundColor: colors.primary }}>
              <Ionicons name="add" size={16} color={colors.background} />
              <ApText size="xs" font="bold" color={colors.background} className="ml-1">
                Add Activity
              </ApText>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => {
            const computed = normalizeDraft(item, index);
            return (
              <View key={item.localId} className="mb-4 rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}>
                <View className="mb-3 flex-row items-center justify-between">
                  <ApText size="sm" font="bold" color={colors.textPrimary}>
                    Activity {index + 1}
                  </ApText>
                  <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => moveItem(index, -1)} className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: colors.background }}>
                      <Ionicons name="chevron-up" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => moveItem(index, 1)} className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: colors.background }}>
                      <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeActivity(item.localId)} className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "#EF444418" }}>
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Field label="Activity title" value={item.title ?? ""} onChangeText={(value: string) => updateItem(item.localId, { title: value })} placeholder="Wake up" />
                <Field label="Description" value={item.description ?? ""} onChangeText={(value: string) => updateItem(item.localId, { description: value })} multiline />
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Field label="Start" value={item.startTime ?? ""} onChangeText={(value: string) => updateItem(item.localId, { startTime: value })} placeholder="03:00" />
                  </View>
                  <View className="flex-1">
                    <Field label="End" value={item.endTime ?? ""} onChangeText={(value: string) => updateItem(item.localId, { endTime: value })} placeholder="03:10" />
                  </View>
                </View>
                <Field label="Duration minutes" value={item.durationText ?? ""} keyboardType="numeric" onChangeText={(value: string) => updateItem(item.localId, { durationText: value })} placeholder="10" />

                {computed.durationMinutes ? (
                  <ApText size="xs" color={colors.textMuted} className="mb-3">
                    Duration: {formatDuration(computed.durationMinutes)}
                  </ApText>
                ) : null}

                <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 uppercase">
                  Link Habit
                </ApText>
                <TouchableOpacity
                  onPress={() => updateItem(item.localId, { showHabitPicker: true } as any)}
                  className="flex-row items-center justify-between rounded-2xl border px-4 py-3"
                  style={{ backgroundColor: colors.background, borderColor: colors.surfaceBorder }}
                >
                  <View className="flex-row items-center flex-1">
                    <Ionicons name="link-outline" size={16} color={computed.linkedHabitId ? colors.primary : colors.textMuted} />
                    <ApText size="sm" color={computed.linkedHabitId ? colors.textPrimary : colors.textMuted} className="ml-2 flex-1">
                      {computed.linkedHabitId ? habits.find((h) => h.id === computed.linkedHabitId)?.title : "Select a habit to link"}
                    </ApText>
                  </View>
                  <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                </TouchableOpacity>

                {item.showHabitPicker ? (
                  <View className="mt-2 rounded-2xl border p-2" style={{ backgroundColor: colors.background, borderColor: colors.surfaceBorder }}>
                    <TouchableOpacity
                      onPress={() => {
                        updateItem(item.localId, { linkedHabitId: "", habitId: "", showHabitPicker: false } as any);
                      }}
                      className="flex-row items-center justify-between rounded-xl px-3 py-2"
                      style={{ backgroundColor: !computed.linkedHabitId ? colors.primary + "15" : "transparent" }}
                    >
                      <ApText size="sm" color={!computed.linkedHabitId ? colors.primary : colors.textSecondary}>
                        None
                      </ApText>
                      {!computed.linkedHabitId && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                    </TouchableOpacity>
                    {habits.filter((habit) => !habit.isArchived).map((habit) => (
                      <TouchableOpacity
                        key={habit.id}
                        onPress={() => {
                          updateItem(item.localId, { linkedHabitId: habit.id, habitId: habit.id, showHabitPicker: false } as any);
                        }}
                        className="flex-row items-center justify-between rounded-xl px-3 py-2"
                        style={{ backgroundColor: computed.linkedHabitId === habit.id ? colors.primary + "15" : "transparent" }}
                      >
                        <ApText size="sm" color={computed.linkedHabitId === habit.id ? colors.primary : colors.textSecondary}>
                          {habit.title}
                        </ApText>
                        {computed.linkedHabitId === habit.id && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}

          {invalid ? (
            <ApText size="sm" color="#EF4444" className="mb-3">
              Check activity times. End time must be after start time, and duration must be greater than zero.
            </ApText>
          ) : null}

          <TouchableOpacity disabled={loading || invalid} onPress={save} className="mt-2 flex-row items-center justify-center rounded-2xl py-4" style={{ backgroundColor: invalid ? colors.surfaceBorder : colors.primary }}>
            <Ionicons name="save-outline" size={18} color={colors.background} />
            <ApText size="base" font="bold" color={colors.background} className="ml-2">
              Save Daily Plan
            </ApText>
          </TouchableOpacity>
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default TaskFormScreen;
