import React from "react";
import { Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Card } from "@/src/components/Card";
import { useTheme } from "@/src/modules/settings/context";

interface Goal { id: string; title: string; percentage: number; iconColor?: string; iconBg?: string; }
interface Props { goals: Goal[]; }

export const GoalSnapshotCard = ({ goals }: Props) => {
  const colors = useTheme();
  return <Card className="p-5 mb-5"><View className="flex-row items-center justify-between mb-4"><View><Text className="text-[17px] font-bold" style={{ color: colors.inkPrimary }}>Habit goals</Text><Text className="text-[12px] mt-1" style={{ color: colors.inkSecondary }}>Your consistency by habit</Text></View><ChevronRight size={19} color={colors.inkTertiary} /></View>{goals.length ? goals.slice(0, 4).map((goal) => <View key={goal.id} className="mb-4"><View className="flex-row items-center justify-between mb-2"><Text className="flex-1 text-[13px] font-semibold" numberOfLines={1} style={{ color: colors.inkPrimary }}>{goal.title}</Text><Text className="text-[13px] font-bold ml-3" style={{ color: goal.iconColor || colors.accent }}>{goal.percentage}%</Text></View><View className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: goal.iconBg || colors.surface2 }}><View className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, goal.percentage))}%`, backgroundColor: goal.iconColor || colors.accent }} /></View></View>) : <Text className="text-[13px]" style={{ color: colors.inkSecondary }}>Create a habit to start building progress.</Text>}</Card>;
};

export default GoalSnapshotCard;
