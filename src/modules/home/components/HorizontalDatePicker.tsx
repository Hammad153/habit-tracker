import React from "react";
import { View, Text, Pressable } from "react-native";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  isAfter,
  startOfDay,
} from "date-fns";
import { useTheme } from "@/src/modules/settings/context";

interface HorizontalDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const HorizontalDatePicker: React.FC<HorizontalDatePickerProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const colors = useTheme();
  const today = startOfDay(new Date());

  // Show the current week
  const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  return (
    <View className="flex-row items-center justify-between py-2">
      {weekDates.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        const isFuture = isAfter(startOfDay(date), today);
        const dayName = format(date, "EEE").slice(0, 2);
        const dayNum = format(date, "d");

        return (
          <Pressable
            key={date.toISOString()}
            disabled={isFuture}
            onPress={() => onDateChange(date)}
            className={`w-[44px] py-2 rounded-md items-center justify-center ${
              isSelected
                ? "bg-background-inverse"
                : "bg-background-surface"
            } ${isFuture ? "opacity-30" : ""}`}
          >
            <Text
              className={`text-[11px] font-semibold ${
                isSelected ? "text-ink-inverse opacity-70" : "text-ink-secondary"
              }`}
            >
              {dayName}
            </Text>
            <Text
              className={`text-[15px] font-bold mt-0.5 ${
                isSelected ? "text-ink-inverse" : "text-ink-primary"
              }`}
            >
              {dayNum}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default HorizontalDatePicker;
