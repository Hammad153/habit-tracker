import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  Pressable,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Plus, Calendar, Clock, Check, Edit3, Trash2 } from "lucide-react-native";
import { router } from "expo-router";
import {
  ApEmptyState,
  ApErrorState,
  ApConfirmModal,
  Skeleton,
  SkeletonHabitList,
} from "@/src/components";
import { Card } from "@/src/components/Card";
import { Button } from "@/src/components/buttons/Button";
import { Checkbox } from "@/src/components/Checkbox";
import { ListRow } from "@/src/components/ListRow";
import { useTheme } from "@/src/modules/settings/context";
import { isSameDateKey, normalizeDateKey, parseDateKey, toDateKey } from "@/src/utils/date";
import { useDailyPlanState } from "./context";
import { useNotificationsState } from "@/src/modules/notifications/context";
import { IDailyPlanTask } from "./model";
import { format } from "date-fns";
import { useFeedback } from "@/src/utils/feedback";
import { ToastService } from "@/src/services";

const formatTime = (value?: string) => {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

export const DailyPlanScreen = () => {
  const colors = useTheme();
  const { triggerSelection } = useFeedback();
  const today = toDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [noteText, setNoteText] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteActivity, setDeleteActivity] = useState<IDailyPlanTask | null>(null);
  const [optimisticOverrides, setOptimisticOverrides] = useState<Record<string, "COMPLETED" | "PENDING">>({});

  const {
    loading,
    error,
    selectedPlan,
    summary,
    fetchPlans,
    fetchSummary,
    createPlan,
    updatePlan,
    updateTask,
    deleteTask,
  } = useDailyPlanState();

  const [fetchingDate, setFetchingDate] = useState(true);

  const load = useCallback(async () => {
    setFetchingDate(true);
    try {
      await Promise.all([fetchPlans({ date: selectedDate }), fetchSummary(selectedDate)]);
    } finally {
      setFetchingDate(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setNoteText("");
    setEditingIndex(null);
    setIsAddingEntry(false);
  }, [selectedDate]);

  // Generate 7 days around selected date
  const days = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const d = new Date(base);
      d.setDate(base.getDate() + index - 3);
      return d;
    });
  }, []);

  const isPlanForCurrentDate = Boolean(
    selectedPlan?.planDate && isSameDateKey(selectedPlan.planDate, selectedDate)
  );

  const activities = useMemo(() => {
    if (selectedPlan?.planDate && !isSameDateKey(selectedPlan.planDate, selectedDate)) {
      return [];
    }
    const items = (selectedPlan?.items ?? selectedPlan?.tasks ?? []) as IDailyPlanTask[];
    return [...items]
      .map((item, idx) => {
        const key = item.id || `${item.title}-${item.startTime || idx}`;
        const overriddenStatus = optimisticOverrides[key];
        return overriddenStatus ? { ...item, status: overriddenStatus } : item;
      })
      .sort((a, b) => {
        const aDone = a.status === "COMPLETED" ? 1 : 0;
        const bDone = b.status === "COMPLETED" ? 1 : 0;
        if (aDone !== bDone) return aDone - bDone;
        const orderA = a.order ?? a.sortOrder ?? 0;
        const orderB = b.order ?? b.sortOrder ?? 0;
        if (orderA !== orderB) return orderA - orderB;
        return (a.startTime ?? "").localeCompare(b.startTime ?? "");
      });
  }, [selectedPlan, optimisticOverrides, selectedDate]);

  const toggleTaskStatus = async (task: IDailyPlanTask, index: number) => {
    triggerSelection();
    const key = task.id || `${task.title}-${task.startTime || index}`;
    const currentStatus = optimisticOverrides[key] || task.status;
    const newStatus: IDailyPlanTask["status"] = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";

    setOptimisticOverrides((prev) => ({ ...prev, [key]: newStatus }));

    let updatedViaApi = false;
    if (task.id) {
      try {
        await updateTask(task.id, { status: newStatus });
        updatedViaApi = true;
      } catch {
        // Fallback to updatePlan below
      }
    }

    if (!updatedViaApi && selectedPlan?.id) {
      const updatedTasks = activities.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t));
      await updatePlan(selectedPlan.id, { tasks: updatedTasks });
    }
  };

  // Parse entries from selectedPlan?.note
  const noteEntries = useMemo(() => {
    const raw = selectedPlan?.note?.trim() || "";
    if (!raw) return [];
    if (raw.includes("\n\n---\n\n")) {
      return raw.split("\n\n---\n\n").map((s) => s.trim()).filter(Boolean);
    }
    const parts = raw.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts : [raw];
  }, [selectedPlan?.note]);

  const handleSaveNoteEntry = async () => {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    setSavingNote(true);
    try {
      let updatedEntries: string[];
      if (editingIndex !== null && editingIndex >= 0 && editingIndex < noteEntries.length) {
        updatedEntries = [...noteEntries];
        updatedEntries[editingIndex] = trimmed;
      } else {
        updatedEntries = [...noteEntries, trimmed];
      }
      const combinedNote = updatedEntries.join("\n\n---\n\n");
      if (selectedPlan?.id) {
        await updatePlan(selectedPlan.id, { note: combinedNote });
      } else {
        await createPlan({ planDate: selectedDate, note: combinedNote });
      }
      setNoteText("");
      setEditingIndex(null);
      setIsAddingEntry(false);
      ToastService.Success("Note saved");
    } catch (err) {
      ToastService.ApiError(err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleEditEntry = (index: number) => {
    setEditingIndex(index);
    setNoteText(noteEntries[index]);
    setIsAddingEntry(true);
  };

  const handleDeleteEntry = async (index: number) => {
    setSavingNote(true);
    try {
      const updatedEntries = noteEntries.filter((_, i) => i !== index);
      const combinedNote = updatedEntries.join("\n\n---\n\n");
      if (selectedPlan?.id) {
        await updatePlan(selectedPlan.id, { note: combinedNote });
      }
      if (editingIndex === index) {
        setEditingIndex(null);
        setNoteText("");
        setIsAddingEntry(false);
      }
      ToastService.Success("Note removed");
    } catch (err) {
      ToastService.ApiError(err);
    } finally {
      setSavingNote(false);
    }
  };

  const completedCount = activities.filter((a) => a.status === "COMPLETED").length;

  const isInitialLoading =
    (loading || fetchingDate) && !refreshing && (!isPlanForCurrentDate || activities.length === 0);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 96,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.accent} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between py-3 mb-2">
          <View>
            <Text className="text-[22px] font-bold text-ink-primary">
              Daily plan
            </Text>
            <Text className="text-[13px] text-ink-secondary mt-0.5">
              {format(parseDateKey(selectedDate), "MMMM d, yyyy")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/planner-calendar")}
            className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-75 border"
            style={{ borderColor: colors.surfaceBorder }}
            accessibilityRole="button"
            accessibilityLabel="View calendar"
          >
            <Calendar size={18} color={colors.inkPrimary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Date Selector Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-5"
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        >
          {days.map((dateObj) => {
            const dateStr = toDateKey(dateObj);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === today;
            const dayLetter = format(dateObj, "EEE")[0];
            const dayNumber = format(dateObj, "d");

            return (
              <Pressable
                key={dateStr}
                onPress={() => setSelectedDate(dateStr)}
                className={`items-center justify-center w-12 py-2.5 rounded-full border ${
                  isSelected
                    ? "bg-background-inverse border-background-inverse"
                    : "bg-background-surface border-transparent"
                }`}
                style={{
                  borderColor: isSelected
                    ? colors.inkPrimary
                    : isToday
                    ? colors.accent
                    : colors.surfaceBorder,
                  backgroundColor: isSelected ? colors.inkPrimary : colors.surface,
                }}
              >
                <Text
                  className="text-[11px] font-semibold"
                  style={{
                    color: isSelected
                      ? colors.inkInverse
                      : isToday
                      ? colors.accent
                      : colors.inkTertiary,
                  }}
                >
                  {dayLetter}
                </Text>
                <Text
                  className="text-[14px] font-bold mt-0.5"
                  style={{
                    color: isSelected ? colors.inkInverse : colors.inkPrimary,
                  }}
                >
                  {dayNumber}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Progress Card */}
        {isInitialLoading ? (
          <View className="mb-5">
            <Skeleton width="100%" height={88} radius={16} />
          </View>
        ) : (
          <Card className="mb-5 p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[14px] font-semibold text-ink-primary">
                Today&apos;s Progress
              </Text>
              <Text className="text-[13px] font-bold text-accent">
                {activities.length > 0
                  ? `${Math.round((completedCount / activities.length) * 100)}%`
                  : "0%"}
              </Text>
            </View>
            <View
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.surface2 }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  backgroundColor: colors.accent,
                  width: activities.length > 0 ? `${(completedCount / activities.length) * 100}%` : "0%",
                }}
              />
            </View>
            <Text className="text-[12px] text-ink-tertiary mt-2">
              {completedCount} of {activities.length} activities completed
            </Text>
          </Card>
        )}

        {/* Activities Section */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[16px] font-bold text-ink-primary">
              Activities
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/add-plan-task",
                  params: { planId: selectedPlan?.id, date: selectedDate },
                })
              }
              className="flex-row items-center gap-1 active:opacity-75"
            >
              <Plus size={16} color={colors.accent} strokeWidth={2.5} />
              <Text className="text-[13px] font-semibold text-accent">
                Add activity
              </Text>
            </TouchableOpacity>
          </View>

          {isInitialLoading ? (
            <SkeletonHabitList count={3} />
          ) : activities.length === 0 ? (
            <Card className="items-center justify-center py-8 px-4 border border-dashed border-border bg-transparent">
              <Clock size={28} color={colors.inkTertiary} strokeWidth={1.5} />
              <Text className="text-[14px] font-medium text-ink-secondary mt-2 text-center">
                No activities planned for this day
              </Text>
              <Button
                variant="secondary"
                label="Plan an activity"
                className="mt-3"
                onPress={() =>
                  router.push({
                    pathname: "/add-plan-task",
                    params: { planId: selectedPlan?.id, date: selectedDate },
                  })
                }
              />
            </Card>
          ) : (
            <View
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              }}
            >
              {activities.map((act, idx) => {
                const isDone = act.status === "COMPLETED";
                const timeStr = [act.startTime, act.endTime].filter(Boolean).map(formatTime).join(" – ");
                return (
                  <ListRow
                    key={act.id || `${act.title}-${idx}`}
                    title={act.title}
                    subtitle={timeStr || act.description}
                    categoryKey="mint"
                    left={
                      <Checkbox
                        checked={isDone}
                        onPress={() => toggleTaskStatus(act, idx)}
                      />
                    }
                    onPress={() =>
                      router.push({
                        pathname: "/add-plan-task",
                        params: { planId: selectedPlan?.id, date: selectedDate },
                      })
                    }
                    isLast={idx === activities.length - 1}
                    isCompleted={isDone}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* Day Notes Section */}
        <View className="mt-2 mb-6">
          <View className="flex-row items-center justify-between mb-2.5">
            <Text
              className="text-[13px] font-semibold"
              style={{ color: colors.inkTertiary }}
            >
              Day notes
            </Text>
            {noteEntries.length > 0 && !isAddingEntry && (
              <TouchableOpacity
                onPress={() => {
                  setEditingIndex(null);
                  setNoteText("");
                  setIsAddingEntry(true);
                }}
                className="flex-row items-center active:opacity-75"
                hitSlop={8}
              >
                <Plus size={14} color={colors.primary} strokeWidth={2.5} />
                <Text
                  className="text-[13px] font-semibold ml-1"
                  style={{ color: colors.primary }}
                >
                  New entry
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Saved Entries List */}
          {noteEntries.length > 0 && (
            <View className="mb-3 gap-2.5">
              {noteEntries.map((entry, idx) => (
                <View
                  key={idx}
                  className="rounded-2xl border p-4"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.surfaceBorder,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View
                      className="px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: colors.surface2 }}
                    >
                      <Text
                        className="text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: colors.inkTertiary }}
                      >
                        Entry {idx + 1}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <TouchableOpacity
                        onPress={() => handleEditEntry(idx)}
                        hitSlop={8}
                        accessibilityLabel="Edit note"
                      >
                        <Edit3 size={15} color={colors.inkTertiary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteEntry(idx)}
                        hitSlop={8}
                        accessibilityLabel="Delete note"
                      >
                        <Trash2 size={15} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text
                    className="text-[14.5px] leading-[22px] font-normal"
                    style={{ color: colors.inkPrimary }}
                  >
                    {entry}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* New / Edit Note Input Box */}
          {(isAddingEntry || noteEntries.length === 0) && (
            <View
              className="rounded-2xl border p-3.5 mb-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              }}
            >
              <TextInput
                placeholder="Reflections, intentions, or notes for today..."
                placeholderTextColor={colors.inkDisabled || colors.inkTertiary}
                value={noteText}
                onChangeText={setNoteText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="text-[14.5px] leading-[22px] min-h-[80px] p-1"
                style={{ color: colors.inkPrimary }}
              />

              <View
                className="flex-row items-center justify-between mt-3 pt-2.5 border-t"
                style={{ borderTopColor: colors.surfaceBorder }}
              >
                {noteEntries.length > 0 ? (
                  <TouchableOpacity
                    onPress={() => {
                      setIsAddingEntry(false);
                      setEditingIndex(null);
                      setNoteText("");
                    }}
                    className="py-1.5 px-3 rounded-full"
                  >
                    <Text
                      className="text-[13px] font-medium"
                      style={{ color: colors.inkTertiary }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}

                <TouchableOpacity
                  onPress={handleSaveNoteEntry}
                  disabled={!noteText.trim() || savingNote}
                  className="flex-row items-center px-4 py-2 rounded-full active:opacity-85"
                  style={{
                    backgroundColor: noteText.trim() ? colors.primary : colors.surfaceInactive,
                    opacity: savingNote ? 0.6 : 1,
                  }}
                >
                  <Check
                    size={15}
                    color={noteText.trim() ? colors.background : colors.textMuted}
                    strokeWidth={2.5}
                  />
                  <Text
                    className="text-[13px] font-semibold ml-1.5"
                    style={{
                      color: noteText.trim() ? colors.background : colors.textMuted,
                    }}
                  >
                    {savingNote ? "Saving..." : editingIndex !== null ? "Update Entry" : "Save Note"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Button to start another entry when input is collapsed */}
          {noteEntries.length > 0 && !isAddingEntry && (
            <TouchableOpacity
              onPress={() => {
                setEditingIndex(null);
                setNoteText("");
                setIsAddingEntry(true);
              }}
              className="flex-row items-center justify-center py-3 px-4 rounded-2xl border border-dashed active:opacity-75 mt-1"
              style={{
                borderColor: colors.surfaceBorder,
                backgroundColor: colors.surface,
              }}
            >
              <Plus size={16} color={colors.primary} />
              <Text
                className="text-[14px] font-semibold ml-2"
                style={{ color: colors.primary }}
              >
                Add another entry
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <ApConfirmModal
        visible={Boolean(deleteActivity)}
        onClose={() => setDeleteActivity(null)}
        onConfirm={async () => {
          if (deleteActivity) {
            await deleteTask(deleteActivity.id);
            setDeleteActivity(null);
            load();
          }
        }}
        title="Delete activity"
        description="Are you sure you want to remove this activity from your plan?"
        confirmText="Delete"
        isDestructive
      />
    </View>
  );
};

export default DailyPlanScreen;
