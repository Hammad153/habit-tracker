import React from "react";
import { View, Text, Modal, Pressable, ScrollView } from "react-native";
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
}

export const ApModal: React.FC<ApModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  subTitle,
  children,
  className = "",
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
        className="flex-1 items-center justify-center px-5"
        style={{ backgroundColor: colors.overlay }}
      >
        <View
          className={`w-full max-w-[340px] bg-background-elevated rounded-lg p-5 max-h-[85%] ${className}`}
          style={{
            shadowColor: colors.inkPrimary,
            shadowOpacity: 0.16,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 8,
          }}
        >
          {title ? (
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-[18px] leading-[24px] font-semibold text-ink-primary">
                  {title}
                </Text>
                {sub ? (
                  <Text className="text-[13px] text-ink-secondary mt-0.5">
                    {sub}
                  </Text>
                ) : null}
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={8}
                className="w-8 h-8 rounded-pill bg-background-surface items-center justify-center"
              >
                <X size={16} color={colors.inkPrimary} strokeWidth={2} />
              </Pressable>
            </View>
          ) : null}
          <ScrollView showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ApModal;
