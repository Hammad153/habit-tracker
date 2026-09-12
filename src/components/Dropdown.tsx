import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { ChevronDown, Check, LucideIcon } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: LucideIcon | React.ComponentType<{ size: number; color: string }>;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  className = "",
}) => {
  const colors = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View className={`w-full ${className}`}>
      {label && (
        <Text className="text-[12px] font-semibold text-ink-tertiary mb-2">
          {label}
        </Text>
      )}
      <Pressable
        onPress={() => setIsOpen(true)}
        className="w-full h-[52px] bg-background-surface rounded-sm px-4 flex-row items-center justify-between"
      >
        <Text
          className={`text-[15px] font-medium ${
            selectedOption ? "text-ink-primary" : "text-ink-tertiary"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color={colors.inkTertiary} strokeWidth={2} />
      </Pressable>

      {/* Options sheet */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View
            className="flex-1 justify-end"
            style={{ backgroundColor: colors.overlay }}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                className="bg-background-elevated rounded-t-xl px-5 pb-8 pt-3 max-h-[70%]"
                style={{
                  shadowColor: colors.inkPrimary,
                  shadowOpacity: 0.16,
                  shadowRadius: 24,
                  shadowOffset: { width: 0, height: -8 },
                  elevation: 8,
                }}
              >
                <View className="w-9 h-1 rounded-pill bg-border-strong self-center mb-4" />
                <Text className="text-[18px] leading-[24px] font-semibold text-ink-primary mb-3">
                  {label || "Select option"}
                </Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {options.map((opt, index) => {
                    const isSelected = opt.value === value;
                    const isLast = index === options.length - 1;
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => handleSelect(opt.value)}
                        className={`flex-row items-center justify-between py-3.5 ${
                          isLast ? "" : "border-b border-border"
                        }`}
                      >
                        <Text
                          className={`text-[15px] leading-[22px] font-medium ${
                            isSelected ? "text-ink-primary" : "text-ink-secondary"
                          }`}
                        >
                          {opt.label}
                        </Text>
                        {isSelected && (
                          <Check size={18} color={colors.accent} strokeWidth={2.5} />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default Dropdown;
