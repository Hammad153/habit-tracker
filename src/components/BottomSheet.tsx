import React from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  DimensionValue,
} from "react-native";
import { X } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: DimensionValue;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  maxHeight = "90%",
}) => {
  const colors = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end"
      >
        <Pressable
          className="absolute inset-0"
          style={{ backgroundColor: colors.overlay }}
          onPress={onClose}
        />
        <View
          className="bg-background-elevated rounded-t-xl px-5 pb-8 pt-3"
          style={{
            maxHeight,
            shadowColor: colors.inkPrimary,
            shadowOpacity: 0.16,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: -8 },
            elevation: 8,
          }}
        >
          {/* Drag Handle */}
          <View className="w-9 h-1 rounded-pill bg-border-strong self-center mb-4" />

          {/* Header */}
          {title ? (
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[18px] leading-[24px] font-semibold text-ink-primary">
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                hitSlop={8}
                className="w-10 h-10 rounded-pill bg-background-surface items-center justify-center"
              >
                <X size={20} color={colors.inkPrimary} strokeWidth={2} />
              </Pressable>
            </View>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default BottomSheet;
