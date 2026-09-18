import React from "react";
import { Text, View } from "react-native";
import { format, subDays } from "date-fns";
import { Card } from "@/src/components/Card";
import { useTheme } from "@/src/modules/settings/context";
import { IHabit } from "@/src/modules/habits/model";
import { getActiveHabits, getCompletionRatioForDate } from "../progress-utils";

interface Props { habits: IHabit[]; completionRate: number; }

export const ConsistencyCard = ({ habits, completionRate }: Props) => {
  const colors = useTheme();
  const days = Array.from({ length: 7 }, (_, index) => subDays(new Date(), 6 - index));
  const dayValues = days.map((date) => getCompletionRatioForDate(getActiveHabits(habits), date));
  const recentAverage = Math.round((dayValues.reduce((sum, value) => sum + value, 0) / 7) * 100);
  const trend = recentAverage >= completionRate ? "up" : "down";
  return <Card className="p-5 mb-5"><View className="flex-row items-start justify-between"><View><Text className="text-[12px] font-bold uppercase" style={{ color: colors.inkTertiary, letterSpacing: 1 }}>Consistency</Text><View className="flex-row items-baseline mt-1"><Text className="text-[30px] font-bold" style={{ color: colors.inkPrimary }}>{recentAverage}%</Text><Text className="text-[12px] ml-2" style={{ color: trend === "up" ? colors.success : colors.danger }}>{trend === "up" ? "↗" : "↘"} last 7 days</Text></View></View><View className="rounded-full px-3 py-1.5" style={{ backgroundColor: colors.accentSoft }}><Text className="text-[11px] font-bold" style={{ color: colors.accent }}>THIS WEEK</Text></View></View><View className="flex-row justify-between mt-6">{days.map((date, index) => { const value = dayValues[index]; const color = value >= 1 ? colors.success : value > 0 ? colors.warning : colors.surface2; return <View key={date.toISOString()} className="items-center"><View className="h-9 w-9 rounded-full items-center justify-center" style={{ backgroundColor: color }}><Text className="text-[12px] font-bold" style={{ color: value > 0 ? colors.inkInverse : colors.inkTertiary }}>{value >= 1 ? "✓" : value > 0 ? "·" : ""}</Text></View><Text className="text-[10px] mt-2" style={{ color: colors.inkTertiary }}>{format(date, "EEEEE")}</Text></View>; })}</View></Card>;
};

export default ConsistencyCard;
