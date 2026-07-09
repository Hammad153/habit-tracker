import React from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "../Text";
import { useTheme } from "@/src/modules/settings/context";

interface IProps {
  label: string;
  onPress: () => void;
  /** Shows a spinner and blocks repeat taps while the request is in flight. */
  loading?: boolean;
  /** Dims the button. It stays pressable so validation errors can be surfaced on tap. */
  enabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  loadingLabel?: string;
}

/** Primary form action with a built-in in-flight state. */
export const ApSubmitButton: React.FC<IProps> = ({
  label,
  onPress,
  loading = false,
  enabled = true,
  icon = "save-outline",
  loadingLabel,
}) => {
  const colors = useTheme();

  return (
    <TouchableOpacity
      disabled={loading}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: loading, busy: loading }}
      className="mt-2 flex-row items-center justify-center rounded-2xl py-4"
      style={{
        backgroundColor: enabled ? colors.primary : colors.surfaceBorder,
        opacity: loading ? 0.75 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.background} />
      ) : (
        <Ionicons name={icon} size={18} color={colors.background} />
      )}
      <ApText size="base" font="bold" color={colors.background} className="ml-2">
        {loading ? (loadingLabel ?? "Saving...") : label}
      </ApText>
    </TouchableOpacity>
  );
};
