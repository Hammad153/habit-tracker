import React from "react";
import { Text, View } from "react-native";
import { Card } from "@/src/components/Card";
import { useTheme } from "@/src/modules/settings/context";
import { getHabitLucideIcon } from "@/src/utils/icons";

interface Goal { id: string; title: string; category?: string; percentage: number; icon?: string; iconColor?: string; iconBg?: string; }
interface Props { goals: Goal[]; }

export const GoalSnapshotCard = ({ goals }: Props) => {
  const colors = useTheme();
  return <Card className="p-4 mb-5"><View className="mb-4"><Text className="text-[17px] font-bold" style={{ color: colors.inkPrimary }}>Habit goals</Text><Text className="text-[12px] mt-1" style={{ color: colors.inkSecondary }}>Your consistency by habit</Text></View>{goals.length ? goals.map((goal) => { const Icon = getHabitLucideIcon(goal.icon); const tone = goal.iconColor || colors.accent; return <View key={goal.id} className="mb-4 last:mb-0"><View className="flex-row items-center"><View className="h-9 w-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: goal.iconBg || colors.accentSoft }}><Icon size={17} color={tone} strokeWidth={2} /></View><View className="flex-1"><View className="flex-row items-center justify-between"><Text className="flex-1 text-[13px] font-bold" numberOfLines={1} style={{ color: colors.inkPrimary }}>{goal.title}</Text><Text className="text-[13px] font-bold ml-3" style={{ color: tone }}>{goal.percentage}%</Text></View><Text className="text-[11px] mt-0.5" style={{ color: colors.inkSecondary }}>{goal.category || "General"}</Text></View></View><View className="w-full h-1.5 rounded-full overflow-hidden mt-3" style={{ backgroundColor: goal.iconBg || colors.surface2 }}><View className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, goal.percentage))}%`, backgroundColor: tone }} /></View></View>; }) : <Text className="text-[13px]" style={{ color: colors.inkSecondary }}>Create a habit to start building progress.</Text>}</Card>;
};

export default GoalSnapshotCard;
