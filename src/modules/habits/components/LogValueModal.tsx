import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import { ApText } from "@/src/components/Text";
import { ApModal } from "@/src/components/Modal";
import { useTheme } from "@/src/modules/settings/context";
import { useFeedback } from "@/src/utils/feedback";

interface LogValueModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (value: number) => void;
  initialValue: number;
  goal: number;
  unit?: string;
  title: string;
}

const LogValueModal: React.FC<LogValueModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialValue,
  goal,
  unit = "times",
  title,
}) => {
  const [value, setValue] = useState(initialValue.toString());
  const colors = useTheme();
  const { triggerSuccess } = useFeedback();

  useEffect(() => {
    if (isVisible) {
      setValue(initialValue.toString());
    }
  }, [isVisible, initialValue]);

  const handleSave = () => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      triggerSuccess();
      onSave(numericValue);
      onClose();
    }
  };

  return (
    <ApModal visible={isVisible} onClose={onClose} title={`Log ${title}`}>
      <View className="items-center mb-8">
        <View className="flex-row items-baseline">
          <TextInput
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            className="text-5xl font-bold mr-2"
            style={{ color: colors.primary }}
            autoFocus
            selectTextOnFocus
          />
          <ApText size="lg" color={colors.textMuted} font="semibold">
            / {goal} {unit}
          </ApText>
        </View>
      </View>

      <View className="flex-row space-x-3 gap-x-2">
        <TouchableOpacity
          onPress={onClose}
          className="flex-1 py-4 rounded-2xl border items-center"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
          }}
        >
          <ApText font="semibold" color={colors.textMuted}>
            Cancel
          </ApText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          className="flex-1 py-4 rounded-2xl items-center"
          style={{ backgroundColor: colors.primary }}
        >
          <ApText font="bold" color={colors.background}>
            Save Progress
          </ApText>
        </TouchableOpacity>
      </View>
    </ApModal>
  );
};

export default LogValueModal;
