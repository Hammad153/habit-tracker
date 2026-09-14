import React, { useState } from "react";
import { Pressable, View, Text } from "react-native";
import { format } from "date-fns";
import { Calendar } from "lucide-react-native";
import { ApDatePicker } from "./DatePicker";
import { useTheme } from "../modules/settings/context";
import { parseDateKey, toDateKey } from "../utils/date";

interface IProps {
  label: string;
  value?: string;
  onChange: (key: string) => void;
  minDate?: Date;
  maxDate?: Date;
  error?: string;
  placeholder?: string;
  title?: string;
  className?: string;
}

export const ApDateField: React.FC<IProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  error,
  placeholder,
  title,
  className = "",
}) => {
  const colors = useTheme();
  const [open, setOpen] = useState(false);
  const selected = value ? parseDateKey(value) : new Date();

  return (
    <View className={`w-full mb-4 ${className}`}>
      <Text className="text-[12px] font-semibold text-ink-tertiary mb-2">
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="w-full h-[52px] bg-background-surface rounded-sm px-4 flex-row items-center justify-between"
        style={{
          borderWidth: error ? 1.5 : 0,
          borderColor: error ? colors.danger : "transparent",
        }}
      >
        <Text
          className={`text-[15px] font-medium ${
            value ? "text-ink-primary" : "text-ink-tertiary"
          }`}
        >
          {value ? format(selected, "EEE, MMM d, yyyy") : placeholder || "Select date"}
        </Text>
        <Calendar size={20} color={colors.inkTertiary} strokeWidth={2} />
      </Pressable>
      {error && (
        <Text className="text-[12px] text-danger mt-1.5 ml-1">
          {error}
        </Text>
      )}
      <ApDatePicker
        visible={open}
        title={title ?? label}
        onClose={() => setOpen(false)}
        selectedDate={selected}
        onSelect={(date) => onChange(toDateKey(date))}
        minDate={minDate}
        maxDate={maxDate}
      />
    </View>
  );
};

export default ApDateField;
