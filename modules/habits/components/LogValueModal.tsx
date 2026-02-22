import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { ApText } from "@/src/components/Text";
import { ApTheme } from "@/src/components/theme";
import { Ionicons } from "@expo/vector-icons";

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
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="w-full">
              <View className="bg-surface rounded-3xl p-6 border border-surfaceBorder">
                <View className="flex-row justify-between items-center mb-6">
                  <ApText size="xl" font="bold" color="white">
                    Log {title}
                  </ApText>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={ApTheme.Color.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                <View className="items-center mb-8">
                  <View className="flex-row items-baseline">
                    <TextInput
                      value={value}
                      onChangeText={setValue}
                      keyboardType="numeric"
                      className="text-5xl font-bold text-primary mr-2"
                      style={{ color: ApTheme.Color.primary }}
                      autoFocus
                      selectTextOnFocus
                    />
                    <ApText
                      size="lg"
                      color={ApTheme.Color.textMuted}
                      font="semibold">
                      / {goal} {unit}
                    </ApText>
                  </View>
                </View>

                <View className="flex-row space-x-3 gap-x-2">
                  <TouchableOpacity
                    onPress={onClose}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 items-center">
                    <ApText font="semibold" color="white">
                      Cancel
                    </ApText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSave}
                    className="flex-1 py-4 rounded-2xl bg-primary items-center"
                    style={{ backgroundColor: ApTheme.Color.primary }}>
                    <ApText font="bold" color="black">
                      Save Progress
                    </ApText>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default LogValueModal;
