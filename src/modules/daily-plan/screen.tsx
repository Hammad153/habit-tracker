import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApContainer, ApEmptyState, ApErrorState, ApHeader, ApLoader, ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { toDateKey } from "@/src/utils/date";
import { useDailyPlanState } from "./context";
import { useNotificationsState } from "@/src/modules/notifications/context";

const priorityColor = (priority: string) => {
  if (priority === "HIGH") return "#EF4444";
  if (priority === "MEDIUM") return "#F59E0B";
  return "#10B981";
};

const DailyPlanScreen = () => {
  const colors = useTheme();
  const today = toDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [note, setNote] = useState("");
  const [refreshing, setRefreshing] = useState(false);
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
      body: "A quick plan can make today's habits easier to protect.",
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

  const ensurePlan = async () => {
    if (selectedPlan) return selectedPlan;
    return createPlan({ planDate: selectedDate, title: selectedDate === today ? "Today's Plan" : "Daily Plan" });
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

  const tasks = selectedPlan?.tasks ?? [];

  return (
    <ApContainer>
      <ApHeader
        title="Daily Plan"
        right={
          <TouchableOpacity
            onPress={async () => {
              const plan = await ensurePlan();
              if (plan?.id) router.push({ pathname: "/add-plan-task", params: { planId: plan.id, date: selectedDate } });
            }}
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

        <View className="mt-5 rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}>
          <View className="flex-row items-center justify-between">
            <View>
              <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase">
                Completion
              </ApText>
              <ApText size="3xl" font="bold" color={colors.textPrimary}>
                {summary?.completionPercentage ?? 0}%
              </ApText>
            </View>
            <View className="items-end">
              <ApText size="sm" color={colors.textSecondary}>
                {summary?.completedTasks ?? 0} done / {summary?.pendingTasks ?? 0} left
              </ApText>
              <ApText size="xs" color={summary?.highPriorityOpen ? "#EF4444" : colors.textMuted}>
                {summary?.highPriorityOpen ?? 0} high priority open
              </ApText>
            </View>
          </View>
          <View className="mt-3 h-3 overflow-hidden rounded-full" style={{ backgroundColor: colors.background }}>
            <View className="h-full rounded-full" style={{ width: `${summary?.completionPercentage ?? 0}%`, backgroundColor: colors.primary }} />
          </View>
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <ApText size="lg" font="bold" color={colors.textPrimary}>
            Priority Tasks
          </ApText>
          <TouchableOpacity onPress={() => router.push("/planner-calendar")}>
            <ApText size="sm" font="bold" color={colors.primary}>
              Calendar
            </ApText>
          </TouchableOpacity>
        </View>

        {!tasks.length ? (
          <ApEmptyState
            icon="calendar-outline"
            title="No tasks planned"
            subtitle="Add a task, time block, or habit-linked action for this day."
            actionLabel="Add Task"
            onAction={async () => {
              const plan = await ensurePlan();
              if (plan?.id) router.push({ pathname: "/add-plan-task", params: { planId: plan.id, date: selectedDate } });
            }}
          />
        ) : (
          tasks.map((task) => {
            const done = task.status === "COMPLETED";
            return (
              <View key={task.id} className="mt-3 rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}>
                <View className="flex-row items-start">
                  <TouchableOpacity
                    onPress={() => updateTask(task.id, { status: done ? "PENDING" : "COMPLETED" })}
                    className="h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: done ? colors.primary : colors.background }}
                  >
                    <Ionicons name={done ? "checkmark" : "ellipse-outline"} size={18} color={done ? colors.background : colors.textMuted} />
                  </TouchableOpacity>
                  <View className="ml-3 flex-1">
                    <View className="flex-row items-center">
                      <View className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: priorityColor(task.priority) }} />
                      <ApText size="xs" font="bold" color={priorityColor(task.priority)}>
                        {task.priority}
                      </ApText>
                    </View>
                    <ApText size="base" font="bold" color={done ? colors.textMuted : colors.textPrimary} className="mt-1">
                      {task.title}
                    </ApText>
                    {task.startTime || task.endTime ? (
                      <ApText size="xs" color={colors.textMuted} className="mt-1">
                        {task.startTime || "--"} - {task.endTime || "--"}
                      </ApText>
                    ) : null}
                    {task.habit ? (
                      <ApText size="xs" color={colors.primary} className="mt-1">
                        Linked habit: {task.habit.title}
                      </ApText>
                    ) : null}
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => router.push({ pathname: "/add-plan-task", params: { id: task.id, planId: task.dailyPlanId, date: selectedDate } })} className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: colors.background }}>
                      <Ionicons name="create-outline" size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteTask(task.id)} className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "#EF444418" }}>
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
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
    </ApContainer>
  );
};

export default DailyPlanScreen;
