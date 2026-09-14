import React from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
  DimensionValue,
} from "react-native";
import { X } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";

export interface ApModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  subTitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
  className?: string;
  wrapperClassName?: string;
  modalClassName?: string;
  dismissOnBackdrop?: boolean;
  showCloseButton?: boolean;
  height?: DimensionValue;
}

export const ApModal: React.FC<ApModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  subTitle,
  children,
  footer,
  scrollable = false,
  className = "",
  wrapperClassName = "",
  modalClassName = "",
  dismissOnBackdrop = true,
  showCloseButton = true,
  height,
}) => {
  const sub = subtitle || subTitle;
  const colors = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className={`flex-1 items-center justify-center p-4 ${wrapperClassName}`}
        style={{
          backgroundColor: colors.overlay,
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {dismissOnBackdrop && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close modal"
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
        )}
        <KeyboardAvoidingView
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : Platform.OS === "web"
                ? undefined
                : "height"
          }
          className={`w-full max-w-[360px] mx-auto ${modalClassName}`}
          pointerEvents="box-none"
          style={{
            width: "100%",
            maxWidth: 360,
            maxHeight: "85%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            className={`w-full rounded-2xl p-5 flex-col ${className}`}
            style={[
              {
                backgroundColor:
                  colors.surfaceElevated || colors.backgroundElevated,
                shadowColor: colors.inkPrimary,
                shadowOpacity: 0.16,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 12 },
                elevation: 8,
                width: "100%",
                maxWidth: 360,
              },
              height ? { height } : {},
            ]}
          >
            {(title || showCloseButton) && (
              <View className="flex-row items-center justify-between mb-3 flex-shrink-0">
                <View className="flex-1 mr-2">
                  {title ? (
                    <Text
                      className="text-[18px] leading-[24px] font-semibold"
                      style={{ color: colors.inkPrimary }}
                    >
                      {title}
                    </Text>
                  ) : null}
                  {sub ? (
                    <Text
                      className="text-[13px] mt-0.5"
                      style={{ color: colors.inkSecondary }}
                    >
                      {sub}
                    </Text>
                  ) : null}
                </View>
                {showCloseButton && (
                  <Pressable
                    onPress={onClose}
                    hitSlop={8}
                    className="w-8 h-8 rounded-pill items-center justify-center"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <X size={16} color={colors.inkPrimary} strokeWidth={2} />
                  </Pressable>
                )}
              </View>
            )}
            {scrollable ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={{ flexShrink: 1 }}
                contentContainerStyle={{ flexGrow: 0 }}
              >
                {children}
              </ScrollView>
            ) : (
              <View>{children}</View>
            )}
            {footer && <View className="mt-3 pt-1 flex-shrink-0">{footer}</View>}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default ApModal;
