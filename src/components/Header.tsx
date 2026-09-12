import React from "react";
import { View, Text, Pressable } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/src/modules/settings/context";

export interface ApHeaderProps {
  title?: string;
  hasBackButton?: boolean;
  onBackPress?: () => void;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  right?: React.ReactNode;
  subtitle?: string;
  subheader?: string;
  className?: string;
}

export const ApHeader: React.FC<ApHeaderProps> = ({
  title,
  hasBackButton = false,
  onBackPress,
  onBack,
  rightAction,
  right,
  subtitle,
  subheader,
  className = "",
}) => {
  const handleBackAction = onBackPress || onBack;
  const rightNode = rightAction || right;
  const subText = subtitle || subheader;
  const colors = useTheme();

  const handleBack = () => {
    if (handleBackAction) {
      handleBackAction();
    } else {
      router.back();
    }
  };

  return (
    <View
      className={`h-[56px] px-5 flex-row items-center justify-between bg-transparent ${className}`}
    >
      <View className="flex-row items-center flex-1 mr-3">
        {hasBackButton && (
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center mr-3 active:opacity-80"
          >
            <ArrowLeft size={20} color={colors.inkPrimary} strokeWidth={2} />
          </Pressable>
        )}
        {title ? (
          <View className="flex-1">
            <Text
              className="text-[22px] leading-[28px] font-bold text-ink-primary text-left"
              numberOfLines={1}
            >
              {title}
            </Text>
            {subText ? (
              <Text className="text-[12px] font-semibold text-ink-tertiary">
                {subText}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
      {rightNode ? (
        <View className="flex-row items-center gap-2">{rightNode}</View>
      ) : null}
    </View>
  );
};

export default ApHeader;
