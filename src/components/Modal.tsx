import React from "react";
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Portal, Modal as PaperModal } from "react-native-paper";
import { ApText } from "./Text";
import { useTheme } from "../modules/settings/context";
import { Ionicons } from "@expo/vector-icons";

interface IProps {
  title?: string;
  subTitle?: string;
  wrapperClassName?: string;
  modalClassName?: string;
  className?: string;
  height?: number;
  onClose: () => void;
  showCloseButton?: boolean;
  dismissOnBackdrop?: boolean;
  visible?: boolean;
  children?: React.ReactNode;
}

export const ApModal: React.FC<IProps> = ({
  title,
  subTitle,
  wrapperClassName,
  modalClassName,
  className,
  height,
  onClose,
  showCloseButton = true,
  dismissOnBackdrop = true,
  visible = false,
  children,
}) => {
  const colors = useTheme();

  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={dismissOnBackdrop ? onClose : undefined}
        contentContainerStyle={{ margin: 24, borderRadius: 24 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className={`w-full ${modalClassName || ""}`}
          >
            <View
              className={`rounded-3xl p-6 border ${className || ""}`}
              style={[
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.surfaceBorder,
                },
                height ? { height } : {},
              ]}
            >
              {(title || showCloseButton) && (
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-1 mr-2">
                    {title && (
                      <ApText size="xl" font="bold" color={colors.textPrimary}>
                        {title}
                      </ApText>
                    )}
                    {subTitle && (
                      <ApText
                        size="sm"
                        color={colors.textSecondary}
                        className="mt-1"
                      >
                        {subTitle}
                      </ApText>
                    )}
                  </View>
                  {showCloseButton && (
                    <TouchableOpacity onPress={onClose}>
                      <Ionicons
                        name="close"
                        size={24}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {children}
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </PaperModal>
    </Portal>
  );
};
