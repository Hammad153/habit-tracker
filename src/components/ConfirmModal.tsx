import React from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { useTheme } from "@/src/modules/settings/context";

export interface ApConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  subTitle?: string;
  subtitle?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ApConfirmModal: React.FC<ApConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  subTitle,
  subtitle,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
}) => {
  const desc = description || subTitle || subtitle;
  const colors = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.overlay }}
      >
        <View
          className="w-full max-w-[320px] rounded-lg p-5"
          style={{
            backgroundColor: colors.surfaceElevated || colors.backgroundElevated,
            shadowColor: colors.inkPrimary,
            shadowOpacity: 0.16,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 8,
          }}
        >
          <Text
            className="text-[18px] leading-[24px] font-semibold mb-2"
            style={{ color: colors.inkPrimary }}
          >
            {title}
          </Text>
          {desc ? (
            <Text
              className="text-[15px] leading-[22px] mb-6"
              style={{ color: colors.inkSecondary }}
            >
              {desc}
            </Text>
          ) : (
            <View className="h-4" />
          )}
          <View className="flex-row gap-3">
            <Pressable
              onPress={onClose}
              className="flex-1 h-[44px] rounded-pill items-center justify-center active:opacity-80"
              style={{ backgroundColor: colors.surface }}
            >
              <Text
                className="text-[15px] font-semibold"
                style={{ color: colors.inkPrimary }}
              >
                {cancelText}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className="flex-1 h-[44px] rounded-pill items-center justify-center active:opacity-80"
              style={{
                backgroundColor: isDestructive
                  ? colors.dangerSoft
                  : colors.backgroundInverse,
              }}
            >
              <Text
                className="text-[15px] font-semibold"
                style={{
                  color: isDestructive ? colors.danger : colors.inkInverse,
                }}
              >
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ApConfirmModal;
