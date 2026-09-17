import React from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";
import { toDateKey } from "@/src/utils/date";
import { getMonthDays, getMonthLabel, getStatusForDate } from "../calendar-utils";
import { CalendarEventStatus } from "../types";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
interface Props { month: Date; selectedDate: Date; today: Date; habits: Parameters<typeof getStatusForDate>[0]; onMonthChange: (offset: number) => void; onDateChange: (date: Date) => void; }

export const MonthCalendar = ({ month, selectedDate, today, habits, onMonthChange, onDateChange }: Props) => {
  const colors = useTheme();
  const selectedKey = toDateKey(selectedDate);
  const todayKey = toDateKey(today);
  const statusColor = (status: CalendarEventStatus | null) => {
    if (status === "done") return colors.success;
    if (status === "partial") return colors.warning;
    if (status === "missed") return colors.danger;
    return colors.inkTertiary;
  };
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 18 }}>
      <View className="flex-row items-center justify-between mb-5">
        <Pressable onPress={() => onMonthChange(-1)} accessibilityLabel="Previous month" className="h-10 w-10 items-center justify-center"><ChevronLeft size={22} color={colors.inkPrimary} /></Pressable>
        <Text style={{ color: colors.inkPrimary }} className="text-[17px] font-bold">{getMonthLabel(month)}</Text>
        <Pressable onPress={() => onMonthChange(1)} accessibilityLabel="Next month" className="h-10 w-10 items-center justify-center"><ChevronRight size={22} color={colors.inkPrimary} /></Pressable>
      </View>
      <View className="flex-row mb-2">{WEEKDAYS.map((day) => <Text key={day} className="flex-1 text-center text-[10px] font-bold" style={{ color: colors.inkTertiary }}>{day}</Text>)}</View>
      <View className="flex-row flex-wrap">
        {getMonthDays(month).map((date, index) => {
          if (!date) return <View key={`empty-${index}`} className="w-[14.285%] h-[48px]" />;
          const key = toDateKey(date); const selected = key === selectedKey; const isToday = key === todayKey; const status = getStatusForDate(habits, date); const color = statusColor(status);
          return <Pressable key={key} onPress={() => onDateChange(date)} className="w-[14.285%] h-[48px] items-center justify-center"><View className="h-9 w-9 items-center justify-center rounded-full" style={selected ? { backgroundColor: color } : undefined}><Text className="text-[15px] font-semibold" style={{ color: selected ? colors.inkInverse : isToday ? color : colors.inkPrimary }}>{date.getDate()}</Text></View>{status && <View className="h-1.5 w-1.5 rounded-full -mt-0.5" style={{ backgroundColor: selected ? colors.inkInverse : color }} />}</Pressable>;
        })}
      </View>
    </View>
  );
};
