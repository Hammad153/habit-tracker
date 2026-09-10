import React from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "../Text";
import { useTheme } from "@/src/modules/settings/context";

interface IProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  enabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  loadingLabel?: string;
}

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
      className="mt-2 flex-row items-center justify-center rounded-full py-4 px-6"
      style={{
        backgroundColor: enabled ? colors.primary : colors.surfaceBorder,
        opacity: loading || !enabled ? 0.75 : 1,
        shadowColor: enabled ? colors.primary : "transparent",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: enabled ? 0.3 : 0,
        shadowRadius: 10,
        elevation: enabled ? 6 : 0,
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
