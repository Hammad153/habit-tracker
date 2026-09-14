import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Bell, ChevronUp, ChevronDown } from "lucide-react-native";
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
          <Bell size={18} color={colors.primary} />
          <ApText
            size="sm"
            font="medium"
            color={colors.textPrimary}
            className="ml-2"
          >
            Reminder
          </ApText>
        </View>
        <TouchableOpacity
          onPress={() => onEnabledChange(!enabled)}
          className="w-10 h-6 rounded-full justify-center px-0.5"
          style={{
            backgroundColor: enabled ? colors.primary : colors.surfaceInactive,
          }}
        >
          <View
            className="w-5 h-5 rounded-full"
            style={{
              backgroundColor: colors.background,
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
            className="flex-row items-center justify-between py-2.5 px-3 rounded-xl mb-3"
            style={{ backgroundColor: colors.surface2 }}
          >
            <ApText size="xs" color={colors.textSecondary}>
              Time
            </ApText>
            <View className="flex-row items-center">
              <ApText size="sm" font="semibold" color={colors.primary}>
                {displayHour.toString().padStart(2, "0")}:
                {minutes.toString().padStart(2, "0")} {period}
              </ApText>
              {expanded ? (
                <ChevronUp size={14} color={colors.textMuted} style={{ marginLeft: 4 }} />
              ) : (
                <ChevronDown size={14} color={colors.textMuted} style={{ marginLeft: 4 }} />
              )}
            </View>
          </TouchableOpacity>

          {expanded && (
            <View className="mb-4 rounded-xl p-3" style={{ backgroundColor: colors.surface2 }}>
              <View className="flex-row items-center justify-between">
                <View className="items-center">
                  <TouchableOpacity
                    onPress={() => setHour(displayHour === 12 ? 1 : displayHour + 1)}
                    className="h-8 w-12 items-center justify-center rounded-lg"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <ChevronUp size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <ApText size="xl" font="semibold" color={colors.textPrimary} className="my-1">
                    {displayHour.toString().padStart(2, "0")}
                  </ApText>
                  <TouchableOpacity
                    onPress={() => setHour(displayHour === 1 ? 12 : displayHour - 1)}
                    className="h-8 w-12 items-center justify-center rounded-lg"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <ChevronDown size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                <ApText size="xl" font="bold" color={colors.textMuted}>
                  :
                </ApText>

                <View className="items-center">
                  <TouchableOpacity
                    onPress={() => setMinute(minutes + 5)}
                    className="h-8 w-12 items-center justify-center rounded-lg"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <ChevronUp size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <ApText size="xl" font="semibold" color={colors.textPrimary} className="my-1">
                    {minutes.toString().padStart(2, "0")}
                  </ApText>
                  <TouchableOpacity
                    onPress={() => setMinute(minutes - 5)}
                    className="h-8 w-12 items-center justify-center rounded-lg"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <ChevronDown size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                <View className="flex-row gap-1">
                  {(["AM", "PM"] as const).map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setPeriod(item)}
                      className="h-9 px-3 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: period === item ? colors.primary : colors.surface,
                      }}
                    >
                      <ApText
                        size="xs"
                        font="semibold"
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
            className="mb-2 uppercase"
            font="medium"
            style={{ letterSpacing: 0.8 }}
          >
            Repeat On
          </ApText>
          <View className="flex-row justify-between">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = days.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => toggleDay(day)}
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surface2,
                  }}
                >
                  <ApText
                    size="xs"
                    font={isSelected ? "semibold" : "normal"}
                    color={isSelected ? colors.background : colors.textMuted}
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
