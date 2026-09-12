import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, TouchableWithoutFeedback } from "react-native";
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
import { ChevronLeft, ChevronRight, X } from "lucide-react-native";
import { useTheme } from "../modules/settings/context";

interface ApDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  selectedDate?: Date;
  maxDate?: Date;
  minDate?: Date;
  title?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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

  useEffect(() => {
    if (visible && selectedDate) setCurrentMonth(selectedDate);
  }, [visible, selectedDate]);

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

  const handleSelectDay = (day: Date) => {
    onSelect(day);
    onClose();
  };

  const days = generateCalendarDays();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          className="flex-1 items-center justify-center px-5"
          style={{ backgroundColor: colors.overlay }}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              className="w-full max-w-[340px] bg-background-elevated rounded-lg p-5"
              style={{
                shadowColor: colors.inkPrimary,
                shadowOpacity: 0.16,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 12 },
                elevation: 8,
              }}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[18px] leading-[24px] font-semibold text-ink-primary">
                  {title}
                </Text>
                <Pressable
                  onPress={onClose}
                  hitSlop={8}
                  className="w-8 h-8 rounded-pill bg-background-surface items-center justify-center"
                >
                  <X size={16} color={colors.inkPrimary} strokeWidth={2} />
                </Pressable>
              </View>

              {/* Month Navigation */}
              <View className="flex-row items-center justify-between mb-4">
                <Pressable
                  onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="w-9 h-9 rounded-pill bg-background-surface items-center justify-center"
                >
                  <ChevronLeft size={18} color={colors.inkPrimary} strokeWidth={2} />
                </Pressable>
                <Text className="text-[15px] font-semibold text-ink-primary">
                  {format(currentMonth, "MMMM yyyy")}
                </Text>
                <Pressable
                  onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="w-9 h-9 rounded-pill bg-background-surface items-center justify-center"
                >
                  <ChevronRight size={18} color={colors.inkPrimary} strokeWidth={2} />
                </Pressable>
              </View>

              {/* Weekday headers */}
              <View className="flex-row justify-between mb-2">
                {WEEKDAYS.map((wd) => (
                  <View key={wd} className="w-10 items-center">
                    <Text className="text-[12px] font-semibold text-ink-tertiary">
                      {wd}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Days Grid */}
              <View className="flex-row flex-wrap justify-between">
                {days.map((d, index) => {
                  const isCurrentMonth = isSameMonth(d, currentMonth);
                  const isSelected = selectedDate && isSameDay(d, selectedDate);
                  const isToday = isSameDay(d, today);
                  const isDisabled =
                    (max && isAfter(startOfDay(d), max)) ||
                    (min && isBefore(startOfDay(d), min));

                  let bgClass = "bg-transparent";
                  let textClass = "text-ink-primary";

                  if (isSelected) {
                    bgClass = "bg-background-inverse";
                    textClass = "text-ink-inverse";
                  } else if (isToday) {
                    bgClass = "bg-background-surface";
                    textClass = "text-accent font-bold";
                  } else if (!isCurrentMonth) {
                    textClass = "text-ink-disabled";
                  }

                  if (isDisabled) {
                    textClass = "text-ink-disabled";
                  }

                  return (
                    <Pressable
                      key={index}
                      disabled={isDisabled}
                      onPress={() => handleSelectDay(d)}
                      className={`w-10 h-10 rounded-pill items-center justify-center my-0.5 ${bgClass}`}
                    >
                      <Text className={`text-[13.5px] font-medium ${textClass}`}>
                        {format(d, "d")}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ApDatePicker;
