import React, { useState } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  StyleProp,
  ViewStyle,
  Text,
} from "react-native";
import { useTheme } from "@/src/modules/settings/context";

export interface ApTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  containerClassName?: string;
  inputClassName?: string;
}

export const ApTextInput: React.FC<ApTextInputProps> = ({
  label,
  error,
  containerStyle,
  containerClassName = "",
  inputClassName = "",
  onFocus,
  onBlur,
  ...props
}) => {
  const colors = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const borderColor = error
    ? colors.danger
    : isFocused
    ? colors.accent
    : "transparent";

  return (
    <View style={containerStyle} className={`w-full ${containerClassName}`}>
      {label && (
        <Text className="text-[12px] font-semibold text-ink-tertiary mb-2">
          {label}
        </Text>
      )}
      <View
        className="w-full flex-row items-center bg-background-surface rounded-sm h-[52px] px-4"
        style={{
          borderWidth: isFocused || error ? 1.5 : 0,
          borderColor,
        }}
      >
        <TextInput
          placeholderTextColor={colors.inkTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`flex-1 text-[15px] font-medium text-ink-primary h-full ${inputClassName}`}
          style={props.style}
          {...props}
        />
      </View>
      {error && (
        <Text className="text-[12px] text-danger mt-1.5 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};

export default ApTextInput;
