import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { ApText } from "@/src/components/Text";
import { ApModal } from "@/src/components/Modal";
import { useTheme } from "@/src/modules/settings/context";

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

  useEffect(() => {
    if (isVisible) {
      setValue(initialValue.toString());
    }
  }, [isVisible, initialValue]);

  const handleSave = () => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
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
            mode="flat"
            textColor={colors.primary}
            style={{
              backgroundColor: "transparent",
              fontSize: 48,
              fontWeight: "bold",
              textAlign: "center",
              width: 120,
            }}
            autoFocus
            selectTextOnFocus
          />
          <ApText size="lg" color={colors.textMuted} font="semibold">
            / {goal} {unit}
          </ApText>
        </View>
      </View>

      <View className="flex-row space-x-3 gap-x-2">
        <Button
          mode="outlined"
          onPress={onClose}
          textColor={colors.textMuted}
          style={{
            flex: 1,
            borderColor: colors.surfaceBorder,
            borderRadius: 16,
          }}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          buttonColor={colors.primary}
          textColor={colors.background}
          labelStyle={{ fontWeight: "bold" }}
          style={{ flex: 1, borderRadius: 16 }}
        >
          Save Progress
        </Button>
      </View>
    </ApModal>
  );
};

export default LogValueModal;
