import React from "react";
import {
  View,
  Modal,
  ModalProps,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ApText } from "./Text";
import { useTheme } from "../modules/settings/context";
import { Ionicons } from "@expo/vector-icons";

interface IProps extends ModalProps {
  title?: string;
  subTitle?: string;
  wrapperClassName?: string;
  modalClassName?: string;
  className?: string;
  height?: number;
  onClose: () => void;
  showCloseButton?: boolean;
  dismissOnBackdrop?: boolean;
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
  children,
  ...modalProps
}) => {
  const colors = useTheme();

  const handleBackdropPress = () => {
    if (dismissOnBackdrop) {
      onClose();
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...modalProps}
    >
      <View
        className={`flex-1 justify-center items-center bg-black/60 px-6 ${wrapperClassName || ""}`}
      >
        {/* Backdrop layer sits BEHIND the card: outside taps dismiss, while
            inputs inside the card receive their own touches (typing works). */}
        {dismissOnBackdrop && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close modal"
            onPress={handleBackdropPress}
            style={StyleSheet.absoluteFill}
          />
        )}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className={`w-full ${modalClassName || ""}`}
          pointerEvents="box-none"
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
                        <ApText
                          size="xl"
                          font="bold"
                          color={colors.textPrimary}
                        >
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
      </View>
    </Modal>
  );
};
