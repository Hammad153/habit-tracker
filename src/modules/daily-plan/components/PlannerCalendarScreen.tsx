import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ApContainer, ApEmptyState, ApHeader, ApScrollView, ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { toDateKey } from "@/src/utils/date";
import { useDailyPlanState } from "../context";

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
          <ApEmptyState icon="calendar-outline" title="No plans yet" subtitle="Create a dated plan from the Daily Plan tab." />
        ) : (
          plans.map((plan) => {
            const done = plan.tasks.filter((task) => task.status === "COMPLETED").length;
            const total = plan.tasks.length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <TouchableOpacity
                key={plan.id}
                onPress={() => router.push("/(tabs)/daily-plan")}
                className="mb-3 rounded-2xl border p-4"
                style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: colors.primary + "18" }}>
                      <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    </View>
                    <View className="ml-3">
                      <ApText size="base" font="bold" color={colors.textPrimary}>
                        {plan.title || "Daily Plan"}
                      </ApText>
                      <ApText size="xs" color={colors.textMuted}>
                        {plan.planDate.slice(0, 10)} • {done}/{total} complete
                      </ApText>
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
