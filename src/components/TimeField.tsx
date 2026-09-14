import React, { useState } from "react";
import { Pressable, View, Text } from "react-native";
import { Clock } from "lucide-react-native";
import { ApTimePicker } from "./TimePicker";
import { useTheme } from "../modules/settings/context";

interface IProps {
  label: string;
  value?: string; // "HH:mm" e.g. "09:00"
  onChange: (time: string) => void;
  error?: string;
  placeholder?: string;
  title?: string;
  className?: string;
}

const formatDisplayTime = (val?: string) => {
  if (!val || !val.includes(":")) return "";
  const [hStr, mStr] = val.split(":");
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return val;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${period}`;
};

export const ApTimeField: React.FC<IProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder = "Select time",
  title,
  className = "",
}) => {
  const colors = useTheme();
  const [open, setOpen] = useState(false);

  const displayTime = value ? formatDisplayTime(value) : "";

  return (
    <View className={`w-full ${className}`}>
      <Text className="text-[12px] font-semibold text-ink-tertiary mb-2">
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="w-full h-[52px] bg-background-surface rounded-sm px-4 flex-row items-center justify-between active:opacity-80"
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
          {displayTime || placeholder}
        </Text>
        <Clock size={19} color={colors.inkTertiary} strokeWidth={2} />
      </Pressable>
      {error && (
        <Text className="text-[12px] text-danger mt-1.5 ml-1">
          {error}
        </Text>
      )}
      <ApTimePicker
        visible={open}
        title={title ?? label}
        selectedTime={value || "09:00"}
        onClose={() => setOpen(false)}
        onSelect={onChange}
      />
    </View>
  );
};

export default ApTimeField;
