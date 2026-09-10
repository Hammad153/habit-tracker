import React, { useState } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from "react-native";
import { ApText } from "./Text";
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
  containerClassName,
  inputClassName,
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

  return (
    <View style={containerStyle} className={`w-full ${containerClassName || ""}`}>
      {label && (
        <ApText
          size="xs"
          font="semibold"
          color={colors.textSecondary}
          className="mb-1.5 uppercase"
          style={{ letterSpacing: 1 }}
        >
          {label}
        </ApText>
      )}
      <View
        className={`w-full flex-row items-center rounded-2xl overflow-hidden`}
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: isFocused ? colors.primary : colors.surfaceBorder,
          shadowColor: isFocused ? colors.primary : "transparent",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isFocused ? 0.1 : 0,
          shadowRadius: 8,
          elevation: isFocused ? 3 : 0,
        }}
      >
        <TextInput
          placeholderTextColor={colors.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`flex-1 px-4 py-4 ${inputClassName || ""}`}
          style={[
            {
              color: colors.textPrimary,
              fontSize: 16,
              fontFamily: "Inter-Medium",
            },
            props.style,
          ]}
          {...props}
        />
      </View>
      {error && (
        <ApText size="xs" color={colors.danger} className="mt-1.5 ml-1">
          {error}
        </ApText>
      )}
    </View>
  );
};
