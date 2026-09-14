import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, Pressable, View } from "react-native";
import { Plus, Calendar, Clock, Check } from "lucide-react-native";
import { router } from "expo-router";
import {
  ApEmptyState,
  ApErrorState,
  ApConfirmModal,
  ApTextInput,
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
  const [note, setNote] = useState("");
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
    setNote(selectedPlan?.note ?? "");
  }, [selectedPlan?.id, selectedPlan?.note]);

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
      try {
        const rawItems = (selectedPlan.items ?? selectedPlan.tasks ?? []) as IDailyPlanTask[];
        const updatedItems = rawItems.map((item, idx) => {
          const isMatch =
            (task.id && item.id === task.id) ||
            idx === index ||
            (item.title === task.title && item.startTime === task.startTime);
          return isMatch ? { ...item, status: newStatus } : item;
        });
        await updatePlan(selectedPlan.id, { items: updatedItems });
      } catch {
        setOptimisticOverrides((prev) => {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        });
      }
    }

    load();
  };

  const handleSaveNote = async () => {
    if (selectedPlan?.id) {
      await updatePlan(selectedPlan.id, { note });
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
            <Text className="text-[12.5px] text-ink-secondary mt-0.5">
              {format(parseDateKey(selectedDate), "EEEE, MMMM d")}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push("/planner-calendar")}
              className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="Calendar"
            >
              <Calendar size={20} color={colors.inkPrimary} strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/add-plan-task",
                  params: { date: selectedDate },
                })
              }
              className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="Add activity"
            >
              <Plus size={20} color={colors.inkPrimary} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        {/* Date Strip */}
        <View className="flex-row items-center justify-between py-2 mb-4">
          {days.map((d) => {
            const key = toDateKey(d);
            const isSelected = key === selectedDate;
            const dayName = format(d, "EEE").slice(0, 2);
            const dayNum = format(d, "d");

            return (
              <Pressable
                key={key}
                onPress={() => setSelectedDate(key)}
                className={"w-[44px] py-2 rounded-md items-center justify-center " + (isSelected ? "bg-background-inverse" : "bg-background-surface")}
              >
                <Text
                  className={"text-[11px] font-semibold " + (isSelected ? "text-ink-inverse opacity-70" : "text-ink-secondary")}
                >
                  {dayName}
                </Text>
                <Text
                  className={"text-[15px] font-bold mt-0.5 " + (isSelected ? "text-ink-inverse" : "text-ink-primary")}
                >
                  {dayNum}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Stats Row */}
        <View className="flex-row items-center justify-between mb-4">
          {isInitialLoading ? (
            <Skeleton width={160} height={28} radius={6} />
          ) : (
            <View>
              <Text className="text-[24px] font-bold text-ink-primary">
                {completedCount} of {activities.length}
              </Text>
              <Text className="text-[11.5px] font-medium text-ink-secondary mt-0.5">
                Activities completed
              </Text>
            </View>
          )}
          {!isInitialLoading && activities.length > 0 && (
            <View className="items-end">
              <Text className="text-[24px] font-bold text-accent">
                {Math.round((completedCount / activities.length) * 100)}%
              </Text>
              <Text className="text-[11.5px] font-medium text-ink-secondary mt-0.5">
                Progress
              </Text>
            </View>
          )}
        </View>

        <View className="h-[1px] bg-border my-2" />

        {/* Activities List */}
        <View className="mt-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[12px] font-semibold text-ink-tertiary">
              Schedule
            </Text>
            {!isInitialLoading && activities.length > 0 && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/add-plan-task",
                    params: { date: selectedDate },
                  })
                }
              >
                <Text className="text-[12px] font-semibold text-accent">
                  + Add task
                </Text>
              </Pressable>
            )}
          </View>

          {isInitialLoading ? (
            <SkeletonHabitList count={3} />
          ) : activities.length === 0 ? (
            <ApEmptyState
              title="No activities planned"
              description="Map out your routine for today to protect your time."
              actionLabel="Add activity"
              onAction={() =>
                router.push({
                  pathname: "/add-plan-task",
                  params: { date: selectedDate },
                })
              }
            />
          ) : (
            <View className="bg-background-surface rounded-lg px-4 py-1 mb-6">
              {activities.map((act, idx) => {
                const isDone = act.status === "COMPLETED";
                const timeText = act.startTime ? formatTime(act.startTime) : "";
                const sub = timeText ? (act.durationMinutes ? `${timeText} · ${act.durationMinutes}m` : timeText) : (act.description || "Planned task");

                return (
                  <ListRow
                    key={act.id}
                    title={act.title}
                    subLabel={sub}
                    icon={Clock}
                    iconBg={colors.backgroundSurface2}
                    iconColor={colors.inkSecondary}
                    trailingControl={
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

        {/* Day Notes */}
        <View className="mt-4">
          <Text className="text-[12px] font-semibold text-ink-tertiary mb-2">
            Day notes
          </Text>
          <ApTextInput
            placeholder="Reflections, intentions, or notes for today..."
            value={note}
            onChangeText={setNote}
            onBlur={handleSaveNote}
            multiline
            numberOfLines={3}
          />
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
