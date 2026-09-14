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
        className={`flex-1 items-center justify-center px-5 ${wrapperClassName}`}
        style={[
          { backgroundColor: colors.overlay },
          Platform.OS === "web"
            ? ({ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 } as any)
            : {},
        ]}
      >
        {dismissOnBackdrop && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close modal"
            onPress={onClose}
            style={[
              StyleSheet.absoluteFill,
              Platform.OS === "web" ? ({ zIndex: 1 } as any) : {},
            ]}
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
          className={`w-full max-w-[380px] ${modalClassName}`}
          pointerEvents="box-none"
          style={Platform.OS === "web" ? ({ zIndex: 2, maxWidth: 440 } as any) : {}}
        >
          <View
            className={`w-full rounded-lg p-5 max-h-[85%] ${className}`}
            style={[
              {
                backgroundColor:
                  colors.surfaceElevated || colors.backgroundElevated,
                shadowColor: colors.inkPrimary,
                shadowOpacity: 0.16,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 12 },
                elevation: 8,
              },
              height ? { height } : {},
            ]}
          >
            {(title || showCloseButton) && (
              <View className="flex-row items-center justify-between mb-4">
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
            <ScrollView showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default ApModal;
