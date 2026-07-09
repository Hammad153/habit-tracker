import React, { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";
import { ApText } from "./Text";
import { ApModal } from "./Modal";
import { useTheme } from "../modules/settings/context";
import { Ionicons } from "@expo/vector-icons";

interface ApDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  selectedDate?: Date;
  maxDate?: Date;
  minDate?: Date;
  title?: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const ApDatePicker: React.FC<ApDatePickerProps> = ({
  visible,
  onClose,
  onSelect,
  selectedDate,
  maxDate = new Date(),
  minDate,
  title = "Select Date",
}) => {
  const colors = useTheme();
  const today = startOfDay(new Date());
  const max = startOfDay(maxDate);
  const min = minDate ? startOfDay(minDate) : undefined;
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  // Reopening the picker should land on the month of the selected day.
  useEffect(() => {
    if (visible && selectedDate) setCurrentMonth(selectedDate);
  }, [visible]);

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  };

  // Navigation is bounded by the selectable range, not by "today", so a picker
  // that allows future dates can actually reach those months.
  const canGoNext = !isAfter(
    startOfMonth(addMonths(currentMonth, 1)),
    startOfMonth(max),
  );
  const canGoPrev =
    !min || !isBefore(startOfMonth(subMonths(currentMonth, 1)), startOfMonth(min));

  const handlePrevMonth = () => {
    if (canGoPrev) setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    if (canGoNext) setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleSelectDate = (date: Date) => {
    onSelect(date);
    onClose();
  };

  const days = generateCalendarDays();

  return (
    <ApModal
      visible={visible}
      onClose={onClose}
      title={title}
      showCloseButton
    >
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={handlePrevMonth}
          className="p-2"
          disabled={!canGoPrev}
          style={{ opacity: canGoPrev ? 1 : 0.3 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <ApText size="lg" font="bold" color={colors.textPrimary}>
          {format(currentMonth, "MMMM yyyy")}
        </ApText>
        <TouchableOpacity
          onPress={handleNextMonth}
          className="p-2"
          disabled={!canGoNext}
          style={{ opacity: canGoNext ? 1 : 0.3 }}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <View className="flex-row mb-2">
        {WEEKDAYS.map((day) => (
          <View key={day} className="flex-1 items-center py-1">
            <ApText size="xs" font="semibold" color={colors.textMuted}>
              {day}
            </ApText>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isDisabled =
            isAfter(startOfDay(day), max) ||
            (!!min && isBefore(startOfDay(day), min));
          const isToday = isSameDay(day, today);

          return (
            <TouchableOpacity
              key={index}
              onPress={() =>
                !isDisabled && isCurrentMonth && handleSelectDate(day)
              }
              disabled={isDisabled || !isCurrentMonth}
              className="items-center justify-center"
              style={{
                width: "14.28%",
                height: 40,
              }}
            >
              <View
                className="w-9 h-9 rounded-full items-center justify-center"
                style={[
                  isSelected && {
                    backgroundColor: colors.primary,
                  },
                  isToday &&
                    !isSelected && {
                      borderWidth: 1,
                      borderColor: colors.primary,
                    },
                ]}
              >
                <ApText
                  size="sm"
                  font={isSelected || isToday ? "bold" : "medium"}
                  color={
                    isSelected
                      ? colors.background
                      : isDisabled || !isCurrentMonth
                        ? colors.textMuted + "40"
                        : isToday
                          ? colors.primary
                          : colors.textPrimary
                  }
                >
                  {format(day, "d")}
                </ApText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ApModal>
  );
};
