import React, { useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { MapPin, Calendar, ChevronRight } from "lucide-react-native";
import {
  ApHeader,
  ApEmptyState,
} from "@/src/components";
import { Card } from "@/src/components/Card";
import { ProgressBar } from "@/src/components/ProgressBar";
import { useTheme } from "@/src/modules/settings/context";
import { normalizeDateKey, parseDateKey, toDateKey } from "@/src/utils/date";
import { useDailyPlanState } from "../context";
import { format } from "date-fns";

const formatTime = (value?: string) => {
  if (!value) return "";
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

export const PlannerCalendarScreen = () => {
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
    <View className="flex-1 bg-background">
      <ApHeader title="Planner calendar" hasBackButton />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 }}
      >
        {plans.length === 0 ? (
          <ApEmptyState
            title="No plans yet"
            description="Create daily schedules from the Plan tab to view them here."
          />
        ) : (
          <View className="gap-3">
            {plans.map((plan) => {
              const items = plan.items ?? plan.tasks ?? [];
              const done = plan.completedItems ?? items.filter((t) => t.status === "COMPLETED").length;
              const total = plan.totalItems ?? items.length;
              const pct = total ? done / total : 0;
              const date = parseDateKey(normalizeDateKey(plan.planDate));

              return (
                <Pressable
                  key={plan.id}
                  onPress={() => router.push("/(tabs)/daily-plan")}
                >
                  <Card className="p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-[15px] font-bold text-ink-primary">
                        {format(date, "EEEE, MMMM d")}
                      </Text>
                      <Text className="text-[14px] font-bold text-accent">
                        {Math.round(pct * 100)}%
                      </Text>
                    </View>
                    <Text className="text-[12.5px] text-ink-secondary mb-3">
                      {done} of {total} completed
                    </Text>
                    <ProgressBar progress={pct} tone="accent" height={4} />
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PlannerCalendarScreen;
