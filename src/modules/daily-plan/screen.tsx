import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApConfirmModal, ApContainer, ApEmptyState, ApErrorState, ApHeader, ApLoader, ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { normalizeDateKey, parseDateKey, toDateKey } from "@/src/utils/date";
import { useDailyPlanState } from "./context";
import { useNotificationsState } from "@/src/modules/notifications/context";
import { IDailyPlanTask } from "./model";

const formatTime = (value?: string) => {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

const formatDuration = (minutes?: number) => {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours} hours`;
};

const planTitle = (dateKey: string) =>
  parseDateKey(dateKey).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const sortActivities = (items: IDailyPlanTask[]) =>
  [...items].sort((a, b) => {
    const orderA = a.order ?? a.sortOrder ?? 0;
    const orderB = b.order ?? b.sortOrder ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return (a.startTime ?? "").localeCompare(b.startTime ?? "");
  });

const DailyPlanScreen = () => {
  const colors = useTheme();
  const today = toDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [note, setNote] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [deleteActivity, setDeleteActivity] = useState<IDailyPlanTask | null>(null);
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
  const { addNotification, notifications } = useNotificationsState();

  const load = useCallback(
    () => Promise.all([fetchPlans({ date: selectedDate }), fetchSummary(selectedDate)]),
    [selectedDate],
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setNote(selectedPlan?.note ?? "");
  }, [selectedPlan?.id, selectedPlan?.note]);

  useEffect(() => {
    if (!summary || selectedDate !== today || summary.totalTasks > 0) return;
    const alreadyCreated = notifications.some(
      (notification) =>
        notification.createdAt.startsWith(today) &&
        notification.type === "system" &&
        notification.title === "Plan your day",
    );
    if (alreadyCreated) return;
    addNotification({
      title: "Plan your day",
      body: "A quick roadmap can make today's habits easier to protect.",
      type: "system",
      route: "/(tabs)/daily-plan",
    });
  }, [summary?.totalTasks, selectedDate, today, addNotification, notifications]);

  const days = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() + index - 3);
      return date;
    });
  }, []);

  const activities = sortActivities(selectedPlan?.items ?? selectedPlan?.tasks ?? []);
  const total = selectedPlan?.totalItems ?? activities.length;
  const completed = selectedPlan?.completedItems ?? activities.filter((item) => item.status === "COMPLETED").length;
  const progress = selectedPlan?.progressPercentage ?? (total ? Math.round((completed / total) * 100) : 0);
  const nextActivity = selectedPlan?.nextItem ?? activities.find((item) => item.status === "PENDING");
  const statusLabel = selectedPlan?.status === "COMPLETED" ? "Completed" : selectedPlan?.status === "IN_PROGRESS" ? "In progress" : "Not started";

  const ensurePlan = async () => {
    if (selectedPlan) return selectedPlan;
    return createPlan({ planDate: selectedDate, title: selectedDate === today ? "Today's Plan" : "Daily Plan", items: [] } as any);
  };

  const openEditor = async () => {
    const plan = await ensurePlan();
    router.push({ pathname: "/add-plan-task", params: { planId: plan?.id, date: selectedDate } });
  };

  const saveReflection = async () => {
    const plan = await ensurePlan();
    if (plan?.id) await updatePlan(plan.id, { note, planDate: selectedDate });
  };

  const onRefresh = () => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  };

  if (loading && !selectedPlan && !summary && !refreshing) return <ApLoader />;

  if (error && !summary) {
    return (
      <ApContainer>
        <ApHeader title="Daily Plan" />
        <ApErrorState onRetry={onRefresh} />
      </ApContainer>
    );
  }

  return (
    <ApContainer>
      <ApHeader
        title="Daily Plan"
        right={
          <TouchableOpacity
            onPress={openEditor}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            <Ionicons name="add" size={22} color={colors.background} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-row gap-2">
          {days.map((date) => {
            const key = toDateKey(date);
            const selected = key === selectedDate;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedDate(key)}
                className="flex-1 rounded-2xl py-3"
                style={{ backgroundColor: selected ? colors.primary : colors.surface }}
              >
                <ApText size="xs" textAlign="center" color={selected ? colors.background : colors.textMuted}>
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </ApText>
                <ApText size="lg" font="bold" textAlign="center" color={selected ? colors.background : colors.textPrimary}>
                  {date.getDate()}
                </ApText>
              </TouchableOpacity>
            );
          })}
        </View>

        {!selectedPlan ? (
          <ApEmptyState
            icon="map-outline"
            title="You have not planned this day yet."
            subtitle="Create a roadmap for your activities so you always know what comes next."
            actionLabel="Plan My Day"
            onAction={openEditor}
          />
        ) : (
          <View className="mt-5 rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}>
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase">
                  {statusLabel}
                </ApText>
                <ApText size="xl" font="bold" color={colors.textPrimary} className="mt-1">
                  {selectedPlan.title || "Daily Plan"}
                </ApText>
                <ApText size="sm" color={colors.textSecondary} className="mt-1">
                  {planTitle(normalizeDateKey(selectedPlan.planDate))}
                </ApText>
              </View>
              <TouchableOpacity onPress={openEditor} className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: colors.background }}>
                <Ionicons name="create-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View className="mt-4 flex-row items-center justify-between">
              <ApText size="sm" color={colors.textSecondary}>
                {completed} of {total} activities completed
              </ApText>
              <ApText size="sm" font="bold" color={colors.primary}>
                {progress}%
              </ApText>
            </View>
            <View className="mt-2 h-3 overflow-hidden rounded-full" style={{ backgroundColor: colors.background }}>
              <View className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: colors.primary }} />
            </View>

            <View className="mt-4 rounded-2xl p-3" style={{ backgroundColor: colors.background }}>
              <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase">
                Next activity
              </ApText>
              <ApText size="sm" font="bold" color={nextActivity ? colors.textPrimary : colors.textMuted} className="mt-1">
                {nextActivity ? `${nextActivity.title}${nextActivity.startTime ? ` at ${formatTime(nextActivity.startTime)}` : ""}` : "All activities are complete"}
              </ApText>
              {selectedPlan.dayStartTime || selectedPlan.dayEndTime ? (
                <ApText size="xs" color={colors.textMuted} className="mt-1">
                  Day schedule: {formatTime(selectedPlan.dayStartTime)} - {formatTime(selectedPlan.dayEndTime)}
                </ApText>
              ) : null}
            </View>

            {!activities.length ? (
              <ApEmptyState
                icon="list-outline"
                title="No activities have been added to this plan."
                actionLabel="Add First Activity"
                onAction={openEditor}
              />
            ) : (
              <View className="mt-5">
                {activities.map((activity, index) => {
                  const done = activity.status === "COMPLETED";
                  const skipped = activity.status === "SKIPPED";
                  const isNext = nextActivity?.id === activity.id;
                  return (
                    <View key={activity.id} className="flex-row">
                      <View className="w-10 items-center">
                        <TouchableOpacity
                          onPress={() => updateTask(activity.id, { status: done ? "PENDING" : "COMPLETED" })}
                          className="h-8 w-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: done ? colors.primary : isNext ? colors.primary + "22" : colors.background, borderWidth: 1, borderColor: done || isNext ? colors.primary : colors.surfaceBorder }}
                        >
                          <Ionicons name={done ? "checkmark" : isNext ? "ellipse" : "ellipse-outline"} size={16} color={done ? colors.background : colors.primary} />
                        </TouchableOpacity>
                        {index < activities.length - 1 ? (
                          <View className="w-0.5 flex-1" style={{ minHeight: 56, backgroundColor: done ? colors.primary : colors.surfaceBorder }} />
                        ) : null}
                      </View>

                      <View className="mb-4 flex-1 rounded-2xl border p-3" style={{ backgroundColor: isNext ? colors.primary + "10" : colors.background, borderColor: isNext ? colors.primary : colors.surfaceBorder }}>
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1 pr-2">
                            <ApText size="xs" color={colors.textMuted}>
                              {formatTime(activity.startTime) || "Any time"}
                              {activity.endTime ? ` - ${formatTime(activity.endTime)}` : ""}
                            </ApText>
                            <ApText size="base" font="bold" color={done || skipped ? colors.textMuted : colors.textPrimary} className={done ? "line-through" : ""}>
                              {activity.title}
                            </ApText>
                            {activity.description ? (
                              <ApText size="xs" color={colors.textSecondary} className="mt-1">
                                {activity.description}
                              </ApText>
                            ) : null}
                            {activity.durationMinutes ? (
                              <ApText size="xs" color={colors.textMuted} className="mt-1">
                                {formatDuration(activity.durationMinutes)}
                              </ApText>
                            ) : null}
                            {activity.linkedHabit || activity.habit ? (
                              <View className="mt-2 flex-row items-center">
                                <Ionicons name="repeat-outline" size={13} color={colors.primary} />
                                <ApText size="xs" color={colors.primary} className="ml-1">
                                  Linked habit: {activity.linkedHabit?.name ?? activity.habit?.title}
                                </ApText>
                              </View>
                            ) : null}
                            {activity.completedAt ? (
                              <ApText size="xs" color={colors.textMuted} className="mt-1">
                                Completed {new Date(activity.completedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                              </ApText>
                            ) : null}
                          </View>
                          <View className="flex-row gap-2">
                            <TouchableOpacity onPress={openEditor} className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: colors.surface }}>
                              <Ionicons name="create-outline" size={16} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setDeleteActivity(activity)} className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "#EF444418" }}>
                              <Ionicons name="trash-outline" size={16} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <View className="mt-6 rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}>
          <ApText size="lg" font="bold" color={colors.textPrimary}>
            Daily Reflection
          </ApText>
          <TextInput
            value={note}
            onChangeText={setNote}
            multiline
            placeholder="What mattered today?"
            placeholderTextColor={colors.textMuted}
            className="mt-3 rounded-2xl border px-4 py-3"
            style={{ minHeight: 110, color: colors.textPrimary, borderColor: colors.surfaceBorder, backgroundColor: colors.background }}
          />
          <TouchableOpacity onPress={saveReflection} className="mt-3 rounded-2xl py-3" style={{ backgroundColor: colors.primary }}>
            <ApText size="sm" font="bold" textAlign="center" color={colors.background}>
              Save Reflection
            </ApText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ApConfirmModal
        visible={!!deleteActivity}
        title="Delete activity?"
        subTitle="This removes only this activity from the Daily Plan."
        destructive
        confirmText="Delete"
        onClose={() => setDeleteActivity(null)}
        onConfirm={async () => {
          if (deleteActivity) await deleteTask(deleteActivity.id);
          setDeleteActivity(null);
        }}
      />
    </ApContainer>
  );
};

export default DailyPlanScreen;
