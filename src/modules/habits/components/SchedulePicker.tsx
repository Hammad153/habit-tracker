import React from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";

const SCHEDULE_TYPES = [
  { id: "daily", label: "Every Day", icon: "calendar" },
  { id: "specific_days", label: "Specific Days", icon: "calendar-outline" },
  { id: "times_per_week", label: "X Times/Week", icon: "repeat" },
  { id: "interval", label: "Every N Days", icon: "swap-horizontal" },
];

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface SchedulePickerProps {
  scheduleType: string;
  scheduleDays: string[];
  timesPerWeek: number;
  intervalDays: number;
  onScheduleTypeChange: (type: string) => void;
  onScheduleDaysChange: (days: string[]) => void;
  onTimesPerWeekChange: (times: number) => void;
  onIntervalDaysChange: (days: number) => void;
}

const SchedulePicker: React.FC<SchedulePickerProps> = ({
  scheduleType,
  scheduleDays,
  timesPerWeek,
  intervalDays,
  onScheduleTypeChange,
  onScheduleDaysChange,
  onTimesPerWeekChange,
  onIntervalDaysChange,
}) => {
  const colors = useTheme();

  const toggleDay = (day: string) => {
    if (scheduleDays.includes(day)) {
      onScheduleDaysChange(scheduleDays.filter((d) => d !== day));
    } else {
      onScheduleDaysChange([...scheduleDays, day]);
    }
  };

  return (
    <View
      className="rounded-2xl p-4 border"
      style={{
        borderColor: colors.surfaceBorder,
        backgroundColor: colors.surface,
      }}
    >
      {/* Schedule type selector */}
      <View className="flex-row flex-wrap gap-2 mb-3">
        {SCHEDULE_TYPES.map((type) => {
          const isSelected = scheduleType === type.id;
          return (
            <TouchableOpacity
              key={type.id}
              onPress={() => onScheduleTypeChange(type.id)}
              className="flex-row items-center px-3 py-2 rounded-xl"
              style={{
                backgroundColor: isSelected
                  ? colors.primary + "20"
                  : colors.background,
                borderWidth: 1,
                borderColor: isSelected
                  ? colors.primary
                  : colors.surfaceBorder,
              }}
            >
              <Ionicons
                name={type.icon as any}
                size={16}
                color={isSelected ? colors.primary : colors.textMuted}
              />
              <ApText
                size="xs"
                font={isSelected ? "bold" : "medium"}
                color={isSelected ? colors.primary : colors.textMuted}
                className="ml-1"
              >
                {type.label}
              </ApText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Specific Days picker */}
      {scheduleType === "specific_days" && (
        <View>
          <ApText
            size="xs"
            color={colors.textMuted}
            className="mb-2"
            font="semibold"
          >
            SELECT DAYS
          </ApText>
          <View className="flex-row justify-between">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = scheduleDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => toggleDay(day)}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.background,
                    borderWidth: isSelected ? 0 : 1,
                    borderColor: colors.surfaceBorder,
                  }}
                >
                  <ApText
                    size="xs"
                    font={isSelected ? "bold" : "medium"}
                    color={isSelected ? "#FFFFFF" : colors.textMuted}
                  >
                    {day.substring(0, 2)}
                  </ApText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Times per week */}
      {scheduleType === "times_per_week" && (
        <View className="flex-row items-center justify-between">
          <ApText size="sm" color={colors.textSecondary}>
            Times per week
          </ApText>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => onTimesPerWeekChange(Math.max(1, timesPerWeek - 1))}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.background }}
            >
              <Ionicons name="remove" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <ApText
              size="lg"
              font="bold"
              color={colors.primary}
              className="mx-4"
            >
              {timesPerWeek}
            </ApText>
            <TouchableOpacity
              onPress={() => onTimesPerWeekChange(Math.min(7, timesPerWeek + 1))}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.background }}
            >
              <Ionicons name="add" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Interval days */}
      {scheduleType === "interval" && (
        <View className="flex-row items-center justify-between">
          <ApText size="sm" color={colors.textSecondary}>
            Every N days
          </ApText>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => onIntervalDaysChange(Math.max(2, intervalDays - 1))}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.background }}
            >
              <Ionicons name="remove" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <ApText
              size="lg"
              font="bold"
              color={colors.primary}
              className="mx-4"
            >
              {intervalDays}
            </ApText>
            <TouchableOpacity
              onPress={() => onIntervalDaysChange(Math.min(30, intervalDays + 1))}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.background }}
            >
              <Ionicons name="add" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default SchedulePicker;
