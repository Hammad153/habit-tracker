import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "./Text";
import { ApDatePicker } from "./DatePicker";
import { useTheme } from "../modules/settings/context";
import { parseDateKey, toDateKey } from "../utils/date";

const DANGER = "#EF4444";

interface IProps {
  label: string;
  /** A `YYYY-MM-DD` date key. */
  value?: string;
  onChange: (key: string) => void;
  minDate?: Date;
  maxDate?: Date;
  error?: string;
  placeholder?: string;
  /** Title of the picker modal. Defaults to the field label. */
  title?: string;
}

/** A tap-to-open date input, so dates are never typed by hand. */
export const ApDateField: React.FC<IProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  error,
  placeholder,
  title,
}) => {
  const colors = useTheme();
  const [open, setOpen] = useState(false);
  const selected = value ? parseDateKey(value) : new Date();

  return (
    <View className="mb-4">
      <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 uppercase">
        {label}
      </ApText>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-2xl border px-4 py-3"
        style={{
          backgroundColor: colors.surface,
          borderColor: error ? DANGER : colors.surfaceBorder,
        }}
      >
        <ApText size="sm" color={value ? colors.textPrimary : colors.textMuted}>
          {value ? format(selected, "EEE, MMM d, yyyy") : placeholder || "Select date"}
        </ApText>
        <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
      </TouchableOpacity>
      {error ? (
        <ApText size="xs" color={DANGER} className="mt-1">
          {error}
        </ApText>
      ) : null}
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
