import React from "react";
import { View, TouchableOpacity } from "react-native";
import { format, addDays, startOfWeek, isSameDay, endOfWeek } from "date-fns";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/modules/settings/context";
import { ApScrollView } from "@/src/components";

interface HorizontalDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const HorizontalDatePicker: React.FC<HorizontalDatePickerProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const colors = useTheme();

  const startDate = startOfWeek(new Date(), { weekStartsOn: 0 }); // Start Monday
  const weekDates = Array.from({ length: 14 }).map((_, i) =>
    addDays(startDate, i),
  );

  return (
    <View className="my-4">
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
              className={`items-center justify-center w-14 h-20 mx-1.5 rounded-2xl ${
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
      </ApScrollView>
    </View>
  );
};

export default HorizontalDatePicker;
