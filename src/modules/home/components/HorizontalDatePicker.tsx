import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  isAfter,
  startOfDay,
} from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/modules/settings/context";
import { ApScrollView, ApDatePicker } from "@/src/components";

interface HorizontalDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const HorizontalDatePicker: React.FC<HorizontalDatePickerProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const colors = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const today = startOfDay(new Date());

  const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDates = Array.from({ length: 7 })
    .map((_, i) => addDays(startDate, i))
    .filter((date) => !isAfter(startOfDay(date), today));

  const handlePickerSelect = (date: Date) => {
    onDateChange(date);
  };

  return (
    <View className="my-4 px-3">
      <ApScrollView horizontal className="px-0">
        {weekDates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          const dayName = format(date, "EEE");
          const dayNumber = format(date, "d");

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onDateChange(date)}
              className={`items-center justify-center w-14 h-20 mr-2 rounded-2xl ${
                isSelected ? "" : "bg-surface"
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: colors.primary,
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                    }
                  : {
                      backgroundColor: colors.surface,
                    }
              }
            >
              <ApText
                size="xs"
                font="semibold"
                color={isSelected ? colors.background : colors.textMuted}
                className="uppercase"
              >
                {dayName}
              </ApText>
              <ApText
                size="lg"
                font="bold"
                color={isSelected ? colors.background : colors.textPrimary}
                className="mt-1"
              >
                {dayNumber}
              </ApText>
              {isToday && !isSelected && (
                <View
                  className="w-1 h-1 rounded-full absolute bottom-2"
                  style={{ backgroundColor: colors.primary }}
                />
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className="items-center justify-center w-14 h-20 rounded-2xl"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.surfaceBorder,
            borderStyle: "dashed",
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={22}
            color={colors.textMuted}
          />
          <ApText
            size="xs"
            font="medium"
            color={colors.textMuted}
            className="mt-1"
          >
            Filter
          </ApText>
        </TouchableOpacity>
      </ApScrollView>

      <ApDatePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handlePickerSelect}
        selectedDate={selectedDate}
      />
    </View>
  );
};

export default HorizontalDatePicker;
