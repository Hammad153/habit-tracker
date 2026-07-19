import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from "react-native";
import { ApText } from "./Text";
import { useTheme } from "../modules/settings/context";
import { Ionicons } from "@expo/vector-icons";

interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
}) => {
  const colors = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View>
      {label && (
        <ApText size="sm" color={colors.textSecondary} className="mb-1.5">
          {label}
        </ApText>
      )}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between px-4 py-3 rounded-xl border"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.surfaceBorder,
        }}
      >
        <View className="flex-row items-center flex-1">
          {selectedOption?.icon && (
            <Ionicons
              name={selectedOption.icon as any}
              size={18}
              color={colors.primary}
              className="mr-2"
            />
          )}
          <ApText
            size="sm"
            color={selectedOption ? colors.textPrimary : colors.textMuted}
          >
            {selectedOption?.label || placeholder}
          </ApText>
        </View>
        <Ionicons
          name="chevron-down"
          size={18}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      <Modal
        transparent
        animationType="fade"
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View
            className="flex-1 justify-center items-center bg-black/60 px-6"
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="w-full max-h-80"
              >
                <View
                  className="rounded-2xl p-2 border"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.surfaceBorder,
                  }}
                >
                  <View className="flex-row justify-between items-center px-3 py-2 mb-2">
                    <ApText size="base" font="semibold" color={colors.textPrimary}>
                      {label || "Select Option"}
                    </ApText>
                    <TouchableOpacity onPress={() => setIsOpen(false)}>
                      <Ionicons name="close" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {options.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => handleSelect(option.value)}
                        className="flex-row items-center px-4 py-3 rounded-xl"
                        style={{
                          backgroundColor:
                            option.value === value
                              ? colors.primary + "15"
                              : "transparent",
                        }}
                      >
                        {option.icon && (
                          <Ionicons
                            name={option.icon as any}
                            size={20}
                            color={
                              option.value === value
                                ? colors.primary
                                : colors.textMuted
                            }
                            className="mr-3"
                          />
                        )}
                        <ApText
                          size="sm"
                          font={option.value === value ? "semibold" : "normal"}
                          color={
                            option.value === value
                              ? colors.primary
                              : colors.textPrimary
                          }
                        >
                          {option.label}
                        </ApText>
                        {option.value === value && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color={colors.primary}
                            className="ml-auto"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};