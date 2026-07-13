import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ApContainer, ApEmptyState, ApHeader, ApScrollView, ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { normalizeDateKey, parseDateKey, toDateKey } from "@/src/utils/date";
import { useDailyPlanState } from "../context";

const formatTime = (value?: string) => {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

const PlannerCalendarScreen = () => {
  const colors = useTheme();
  const { plans, fetchPlans } = useDailyPlanState();

  useEffect(() => {
    const start = new Date();
    start.setDate(start.getDate() - 15);
    const end = new Date();
    end.setDate(end.getDate() + 15);
    fetchPlans({ startDate: toDateKey(start), endDate: toDateKey(end) });
  }, []);

  return (
    <ApContainer>
      <ApHeader title="Planner" hasBackButton />
      <ApScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {!plans.length ? (
          <ApEmptyState icon="calendar-outline" title="No plans yet" subtitle="Create a dated roadmap from the Daily Plan tab." />
        ) : (
          plans.map((plan) => {
            const items = plan.items ?? plan.tasks ?? [];
            const done = plan.completedItems ?? items.filter((task) => task.status === "COMPLETED").length;
            const total = plan.totalItems ?? items.length;
            const pct = plan.progressPercentage ?? (total ? Math.round((done / total) * 100) : 0);
            const date = parseDateKey(normalizeDateKey(plan.planDate));
            const status = plan.status === "COMPLETED" ? "Completed" : plan.status === "IN_PROGRESS" ? "In progress" : "Not started";
            return (
              <TouchableOpacity
                key={plan.id}
                onPress={() => router.push("/(tabs)/daily-plan")}
                className="mb-3 rounded-2xl border p-4"
                style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-row flex-1 items-start pr-3">
                    <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: colors.primary + "18" }}>
                      <Ionicons name="map-outline" size={20} color={colors.primary} />
                    </View>
                    <View className="ml-3 flex-1">
                      <ApText size="base" font="bold" color={colors.textPrimary}>
                        {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </ApText>
                      <ApText size="xs" color={colors.textMuted}>
                        {done} of {total} completed • {status}
                      </ApText>
                      <ApText size="xs" color={colors.textSecondary} className="mt-1">
                        Next: {plan.nextItem ? `${plan.nextItem.title}${plan.nextItem.startTime ? ` - ${formatTime(plan.nextItem.startTime)}` : ""}` : "Nothing pending"}
                      </ApText>
                      {plan.dayStartTime || plan.dayEndTime ? (
                        <ApText size="xs" color={colors.textMuted} className="mt-1">
                          Day schedule: {formatTime(plan.dayStartTime)} - {formatTime(plan.dayEndTime)}
                        </ApText>
                      ) : null}
                    </View>
                  </View>
                  <ApText size="lg" font="bold" color={colors.primary}>
                    {pct}%
                  </ApText>
                </View>
                <View className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: colors.background }}>
                  <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors.primary }} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ApScrollView>
    </ApContainer>
  );
};

export default PlannerCalendarScreen;
