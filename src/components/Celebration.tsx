import React from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { Flame, Check } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";

export interface CelebrationProps {
  visible: boolean;
  onClose?: () => void;
  onDismiss?: () => void;
  title?: string;
  milestone?: string;
  subtitle?: string;
  subtext?: string;
  icon?: "flame" | "check";
  buttonText?: string;
}

export const Celebration: React.FC<CelebrationProps> = ({
  visible,
  onClose,
  onDismiss,
  title,
  milestone,
  subtitle,
  subtext,
  icon = "check",
  buttonText = "Continue",
}) => {
  const handleClose = onClose || onDismiss || (() => {});
  const displayTitle = title || milestone || "Congratulations!";
  const displaySubtitle = subtitle || subtext;
  const colors = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.overlay }}
      >
        <View
          className="w-full max-w-[320px] bg-background-elevated rounded-xl p-6 items-center"
          style={{
            shadowColor: colors.inkPrimary,
            shadowOpacity: 0.16,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 8,
          }}
        >
          <View className="w-16 h-16 rounded-pill bg-accent-soft items-center justify-center mb-5">
            {icon === "flame" ? (
              <Flame size={28} color={colors.accent} strokeWidth={2} />
            ) : (
              <Check size={28} color={colors.accent} strokeWidth={2.5} />
            )}
          </View>
          <Text className="text-[24px] leading-[28px] font-bold text-ink-primary text-center">
            {displayTitle}
          </Text>
          {subtitle ? (
            <Text className="text-[15px] leading-[22px] text-ink-secondary text-center mt-2 mb-6">
              {displaySubtitle}
            </Text>
          ) : (
            <View className="h-6" />
          )}
          <Pressable
            onPress={handleClose}
            className="w-full h-[52px] rounded-pill bg-background-inverse items-center justify-center active:opacity-90 active:scale-[0.97]"
          >
            <Text className="text-ink-inverse text-[16px] font-semibold">
              {buttonText}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default Celebration;

export const ApCelebration = Celebration;
