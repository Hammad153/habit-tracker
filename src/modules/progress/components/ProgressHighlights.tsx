import React from "react";
import { Text, View } from "react-native";
import { Award, Flame, Target } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";
import { Card } from "@/src/components/Card";

interface Props { streak: number; badges: number; completionRate: number; }

const MetricCard = ({ icon: Icon, value, label, color, soft }: { icon: React.ComponentType<any>; value: string | number; label: string; color: string; soft: string }) => {
  const colors = useTheme();
  return <Card className="flex-1 p-4" style={{ minHeight: 132 }}><View className="h-10 w-10 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: soft }}><Icon size={21} color={color} strokeWidth={2.2} /></View><Text className="text-[26px] font-bold" style={{ color: colors.inkPrimary }}>{value}</Text><Text className="text-[12px] mt-0.5" style={{ color: colors.inkSecondary }}>{label}</Text></Card>;
};

export const ProgressHighlights = ({ streak, badges, completionRate }: Props) => {
  const colors = useTheme();
  return <View className="flex-row gap-3 mb-5"><MetricCard icon={Flame} value={streak} label="Day streak" color={colors.warning} soft={colors.warningSoft} /><MetricCard icon={Award} value={badges} label="Badges earned" color={colors.primary} soft={colors.accentSoft} /><MetricCard icon={Target} value={`${completionRate}%`} label="Overall rate" color={colors.category.violet.ink} soft={colors.category.violet.bg} /></View>;
};

export default ProgressHighlights;
