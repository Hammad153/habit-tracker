import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "./Text";
import { useTheme } from "@/src/modules/settings/context";

interface IProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ApErrorState: React.FC<IProps> = ({
  title = "Something went wrong",
  message = "We couldn't load this right now. Please check your connection and try again.",
  onRetry,
  retryLabel = "Try Again",
}) => {
  const colors = useTheme();

  return (
    <View className="items-center justify-center py-16 px-8">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: colors.danger + "1A" }}
      >
        <Ionicons name="cloud-offline-outline" size={36} color={colors.danger} />
      </View>
      <ApText
        size="lg"
        font="bold"
        color={colors.textPrimary}
        style={{ textAlign: "center" }}
      >
        {title}
      </ApText>
      <ApText
        size="sm"
        color={colors.textMuted}
        style={{ textAlign: "center", marginTop: 6 }}
      >
        {message}
      </ApText>
      {onRetry ? (
        <TouchableOpacity
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          className="mt-6 px-6 py-3 rounded-2xl flex-row items-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Ionicons name="refresh" size={18} color={colors.background} />
          <ApText font="bold" color={colors.background} style={{ marginLeft: 8 }}>
            {retryLabel}
          </ApText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};
