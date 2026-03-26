import React, { useState } from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { DAYS_OF_WEEK } from "../model";

interface ReminderPickerProps {
  time: string; // HH:mm
  days: string[];
  enabled: boolean;
  onTimeChange: (time: string) => void;
  onDaysChange: (days: string[]) => void;
  onEnabledChange: (enabled: boolean) => void;
}

const ReminderPicker: React.FC<ReminderPickerProps> = ({
  time,
  days,
  enabled,
  onTimeChange,
  onDaysChange,
  onEnabledChange,
}) => {
  const colors = useTheme();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [hours, minutes] = time.split(":").map(Number);
  const timeDate = new Date();
  timeDate.setHours(hours, minutes, 0, 0);

  const toggleDay = (day: string) => {
    if (days.includes(day)) {
      onDaysChange(days.filter((d) => d !== day));
    } else {
      onDaysChange([...days, day]);
    }
  };

  const handleTimeChange = (_: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedDate) {
      const h = selectedDate.getHours().toString().padStart(2, "0");
      const m = selectedDate.getMinutes().toString().padStart(2, "0");
      onTimeChange(`${h}:${m}`);
    }
  };

  return (
    <View
      className="rounded-2xl p-4 border"
      style={{ borderColor: colors.surfaceBorder, backgroundColor: colors.surface }}
    >
      {/* Toggle header */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Ionicons name="notifications" size={20} color={colors.primary} />
          <ApText
            size="base"
            font="semibold"
            color={colors.textPrimary}
            className="ml-2"
          >
            Reminder
          </ApText>
        </View>
        <TouchableOpacity
          onPress={() => onEnabledChange(!enabled)}
          className="w-12 h-7 rounded-full justify-center px-1"
          style={{
            backgroundColor: enabled ? colors.primary : colors.surfaceInactive,
          }}
        >
          <View
            className="w-5 h-5 rounded-full bg-white"
            style={{
              alignSelf: enabled ? "flex-end" : "flex-start",
            }}
          />
        </TouchableOpacity>
      </View>

      {enabled && (
        <>
          {/* Time picker */}
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="flex-row items-center justify-between py-3 px-3 rounded-xl mb-3"
            style={{ backgroundColor: colors.background }}
          >
            <ApText size="sm" color={colors.textSecondary}>
              Time
            </ApText>
            <View className="flex-row items-center">
              <ApText size="lg" font="bold" color={colors.primary}>
                {time}
              </ApText>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textMuted}
                style={{ marginLeft: 4 }}
              />
            </View>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={timeDate}
              mode="time"
              is24Hour={true}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTimeChange}
            />
          )}

          {/* Day picker */}
          <ApText
            size="xs"
            color={colors.textMuted}
            className="mb-2"
            font="semibold"
          >
            REPEAT ON
          </ApText>
          <View className="flex-row justify-between">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = days.includes(day);
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
        </>
      )}
    </View>
  );
};

export default ReminderPicker;
