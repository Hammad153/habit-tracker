import React from "react";
import { View, Text } from "react-native";
import { LucideIcon, Inbox } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";
import Button from "./buttons/Button";

export interface ApEmptyStateProps {
  icon?: any;
  title: string;
  description?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const ApEmptyState: React.FC<ApEmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  subtitle,
  actionLabel,
  onAction,
  className = "",
}) => {
  const desc = description || subtitle;
  const colors = useTheme();

  return (
    <View className={`items-center justify-center py-12 px-6 ${className}`}>
      <View className="w-14 h-14 rounded-pill bg-background-surface items-center justify-center mb-4">
        <Icon size={28} color={colors.inkTertiary} strokeWidth={2} />
      </View>
      <Text className="text-[18px] leading-[24px] font-semibold text-ink-primary text-center">
        {title}
      </Text>
      {desc ? (
        <Text className="text-[15px] leading-[22px] text-ink-secondary text-center mt-1.5 max-w-[280px]">
          {desc}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-6 w-full max-w-[220px]">
          <Button label={actionLabel} onPress={onAction} variant="primary" />
        </View>
      ) : null}
    </View>
  );
};

export default ApEmptyState;
