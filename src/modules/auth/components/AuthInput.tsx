import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/modules/settings/context";

interface IProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  secure?: boolean;
}

const AuthInput: React.FC<IProps> = ({ label, icon, secure, ...rest }) => {
  const colors = useTheme();
  const [focused, setFocused] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  return (
    <View className="mb-5">
      <Text
        className="mb-2 font-medium text-sm"
        style={{ color: colors.textPrimary }}
      >
        {label}
      </Text>
      <View
        className="flex-row items-center px-4 rounded-xl border"
        style={{
          backgroundColor: colors.surface,
          borderColor: focused ? colors.primary : colors.surfaceBorder,
        }}
      >
        <Ionicons
          name={icon}
          size={20}
          color={focused ? colors.primary : colors.textMuted}
        />
        <TextInput
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          secureTextEntry={secure && !showSecret}
          placeholderTextColor={colors.textMuted}
          className="flex-1 py-4 px-3 text-base"
          style={{ color: colors.textPrimary }}
        />
        {secure ? (
          <TouchableOpacity onPress={() => setShowSecret((v) => !v)}>
            <Ionicons
              name={showSecret ? "eye-off" : "eye"}
              size={22}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default AuthInput;
