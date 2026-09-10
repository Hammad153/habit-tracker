import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ApModal } from "./Modal";
import { ApText } from "./Text";
import { useTheme } from "../modules/settings/context";

interface IProps {
  visible: boolean;
  title: string;
  subTitle?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ApConfirmModal: React.FC<IProps> = ({
  visible,
  title,
  subTitle,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  onConfirm,
  onClose,
}) => {
  const colors = useTheme();

  return (
    <ApModal
      visible={visible}
      onClose={onClose}
      title={title}
      subTitle={subTitle}
    >
      <View className="flex-row gap-x-2 mt-2">
        <TouchableOpacity
          onPress={onClose}
          className="flex-1 py-4 rounded-full border items-center"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
          }}
        >
          <ApText font="semibold" color={colors.textMuted}>
            {cancelText}
          </ApText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onConfirm}
          className="flex-1 py-4 rounded-full items-center"
          style={{
            backgroundColor: destructive ? colors.danger : colors.primary,
            shadowColor: destructive ? colors.danger : colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <ApText font="bold" color={colors.white}>
            {confirmText}
          </ApText>
        </TouchableOpacity>
      </View>
    </ApModal>
  );
};
