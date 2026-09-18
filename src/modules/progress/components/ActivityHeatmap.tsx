import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import { addDays, format, startOfWeek, subDays } from "date-fns";
import { IHabit } from "@/src/modules/habits/model";
import { useTheme } from "@/src/modules/settings/context";
import { ApText } from "@/src/components/Text";
import { ApCard } from "@/src/components/Card";
import { normalizeDateKey, toDateKey } from "@/src/utils/date";

interface ActivityHeatmapProps { habits: IHabit[]; }
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKS = 12;
const CELL_SIZE = 16;
const CELL_GAP = 4;

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ habits }) => {
  const colors = useTheme();
  const today = useMemo(() => new Date(), []);
  const startDate = startOfWeek(subDays(today, (WEEKS - 1) * 7), { weekStartsOn: 0 });
  const completionByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    habits.filter((habit) => !habit.isArchived).forEach((habit) => {
      (habit.completions ?? []).forEach((completion) => {
        if (!completion.status) return;
        const dateKey = normalizeDateKey(completion.date);
        if (!dateKey) return;
        if (!map.has(dateKey)) map.set(dateKey, new Set<string>());
        map.get(dateKey)?.add(habit.id);
      });
    });
    return map;
  }, [habits]);
  const shades = [colors.surfaceInactive, colors.heatmapLight, colors.heatmapMid, colors.primary, colors.accentStrong];
  const getShade = (count: number) => shades[Math.min(count, shades.length - 1)];

  return (
    <ApCard className="p-4 w-full mb-4">
      <View className="flex-row items-center justify-between mb-1"><ApText size="sm" font="semibold" color={colors.textPrimary}>Activity</ApText><ApText size="xs" color={colors.textMuted}>Last 12 weeks</ApText></View>
      <ApText size="xs" color={colors.textMuted} className="mb-4">Each square is one day · darker means more habits completed</ApText>
      <View className="flex-row">
        <View className="mr-2 pt-5" style={{ gap: CELL_GAP }}>{DAY_LABELS.map((day) => <View key={day} style={{ height: CELL_SIZE, justifyContent: "center" }}><ApText size="xs" color={colors.textMuted} style={{ fontSize: 9 }}>{day.slice(0, 1)}</ApText></View>)}</View>
        <View className="flex-1">
          <View className="flex-row mb-2" style={{ gap: CELL_GAP }}>{Array.from({ length: WEEKS }).map((_, weekIndex) => { const date = addDays(startDate, weekIndex * 7); const previous = addDays(startDate, Math.max(0, (weekIndex - 1) * 7)); const showLabel = weekIndex === 0 || date.getMonth() !== previous.getMonth(); return <View key={`month-${weekIndex}`} style={{ width: CELL_SIZE }}><ApText size="xs" color={colors.textMuted} style={{ fontSize: 9, width: 38 }}>{showLabel ? format(date, "MMM") : ""}</ApText></View>; })}</View>
          <View className="flex-row" style={{ gap: CELL_GAP }}>{Array.from({ length: WEEKS }).map((_, weekIndex) => <View key={`week-${weekIndex}`} style={{ gap: CELL_GAP }}>{Array.from({ length: 7 }).map((__, dayIndex) => { const date = addDays(startDate, weekIndex * 7 + dayIndex); const isFuture = date > today; const count = isFuture ? 0 : completionByDate.get(toDateKey(date))?.size ?? 0; return <Pressable key={toDateKey(date)} accessibilityLabel={`${format(date, "MMM d")}: ${count} habits completed`} style={{ width: CELL_SIZE, height: CELL_SIZE, borderRadius: 4, backgroundColor: isFuture ? colors.background : getShade(count) }} />; })}</View>)}</View>
        </View>
      </View>
      <View className="flex-row items-center justify-end mt-4"><ApText size="xs" color={colors.textMuted} style={{ fontSize: 10 }}>Less</ApText>{shades.map((shade, index) => <View key={index} className="rounded" style={{ width: 13, height: 13, marginLeft: 4, backgroundColor: shade }} />)}<ApText size="xs" color={colors.textMuted} style={{ fontSize: 10, marginLeft: 4 }}>More</ApText></View>
      <View className="flex-row items-center justify-end mt-1"><ApText size="xs" color={colors.textMuted} style={{ fontSize: 9 }}>0</ApText><ApText size="xs" color={colors.textMuted} style={{ fontSize: 9, marginLeft: 28 }}>1</ApText><ApText size="xs" color={colors.textMuted} style={{ fontSize: 9, marginLeft: 10 }}>2</ApText><ApText size="xs" color={colors.textMuted} style={{ fontSize: 9, marginLeft: 10 }}>3</ApText><ApText size="xs" color={colors.textMuted} style={{ fontSize: 9, marginLeft: 10 }}>4+</ApText></View>
    </ApCard>
  );
};

export default ActivityHeatmap;
