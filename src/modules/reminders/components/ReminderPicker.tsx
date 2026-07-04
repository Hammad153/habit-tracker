import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

  const [hours, minutes] = time.split(":").map(Number);
  const [expanded, setExpanded] = useState(false);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  const toggleDay = (day: string) => {
    if (days.includes(day)) {
      onDaysChange(days.filter((d) => d !== day));
    } else {
      onDaysChange([...days, day]);
    }
  };

  const commitTime = (nextHour: number, nextMinute: number, nextPeriod: "AM" | "PM") => {
    const normalizedHour =
      nextPeriod === "AM"
        ? nextHour === 12
          ? 0
          : nextHour
        : nextHour === 12
          ? 12
          : nextHour + 12;
    onTimeChange(
      `${normalizedHour.toString().padStart(2, "0")}:${nextMinute
        .toString()
        .padStart(2, "0")}`,
    );
  };

  const setHour = (nextHour: number) =>
    commitTime(Math.min(12, Math.max(1, nextHour)), minutes, period);
  const setMinute = (nextMinute: number) =>
    commitTime(displayHour, (nextMinute + 60) % 60, period);
  const setPeriod = (nextPeriod: "AM" | "PM") =>
    commitTime(displayHour, minutes, nextPeriod);

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
            onPress={() => setExpanded((value) => !value)}
            className="flex-row items-center justify-between py-3 px-3 rounded-xl mb-3"
            style={{ backgroundColor: colors.background }}
          >
            <ApText size="sm" color={colors.textSecondary}>
              Time
            </ApText>
            <View className="flex-row items-center">
              <ApText size="lg" font="bold" color={colors.primary}>
                {displayHour.toString().padStart(2, "0")}:
                {minutes.toString().padStart(2, "0")} {period}
              </ApText>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textMuted}
                style={{ marginLeft: 4 }}
              />
            </View>
          </TouchableOpacity>

          {expanded && (
            <View className="mb-4 rounded-2xl p-3" style={{ backgroundColor: colors.background }}>
              <View className="flex-row items-center justify-between">
                <View className="items-center">
                  <TouchableOpacity
                    onPress={() => setHour(displayHour === 12 ? 1 : displayHour + 1)}
                    className="h-9 w-14 items-center justify-center rounded-xl"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Ionicons name="chevron-up" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <ApText size="2xl" font="bold" color={colors.textPrimary} className="my-2">
                    {displayHour.toString().padStart(2, "0")}
                  </ApText>
                  <TouchableOpacity
                    onPress={() => setHour(displayHour === 1 ? 12 : displayHour - 1)}
                    className="h-9 w-14 items-center justify-center rounded-xl"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Ionicons name="chevron-down" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <ApText size="xs" color={colors.textMuted} className="mt-2">
                    Hour
                  </ApText>
                </View>

                <ApText size="3xl" font="bold" color={colors.textMuted}>
                  :
                </ApText>

                <View className="items-center">
                  <TouchableOpacity
                    onPress={() => setMinute(minutes + 5)}
                    className="h-9 w-14 items-center justify-center rounded-xl"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Ionicons name="chevron-up" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <ApText size="2xl" font="bold" color={colors.textPrimary} className="my-2">
                    {minutes.toString().padStart(2, "0")}
                  </ApText>
                  <TouchableOpacity
                    onPress={() => setMinute(minutes - 5)}
                    className="h-9 w-14 items-center justify-center rounded-xl"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Ionicons name="chevron-down" size={18} color={colors.primary} />
                  </TouchableOpacity>
                  <ApText size="xs" color={colors.textMuted} className="mt-2">
                    Minute
                  </ApText>
                </View>

                <View className="rounded-2xl border p-1" style={{ borderColor: colors.surfaceBorder }}>
                  {(["AM", "PM"] as const).map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setPeriod(item)}
                      className="h-10 w-14 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: period === item ? colors.primary : "transparent",
                      }}
                    >
                      <ApText
                        size="sm"
                        font="bold"
                        color={period === item ? colors.background : colors.textMuted}
                      >
                        {item}
                      </ApText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
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
