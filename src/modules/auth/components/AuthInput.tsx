import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  TextInputProps,
} from "react-native";
import { Mail, Lock, User, Eye, EyeOff, LucideIcon } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";

interface IProps extends TextInputProps {
  label: string;
  icon?: "mail" | "lock" | "user" | any;
  secure?: boolean;
}

const iconComponentMap: Record<string, LucideIcon> = {
  mail: Mail,
  "mail-outline": Mail,
  lock: Lock,
  "lock-closed-outline": Lock,
  user: User,
  "person-outline": User,
};

export const AuthInput: React.FC<IProps> = ({ label, icon, secure, ...rest }) => {
  const colors = useTheme();
  const [focused, setFocused] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const IconComponent = (icon && iconComponentMap[icon as string]) || (icon === "user" ? User : icon === "lock" ? Lock : Mail);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-[12px] font-semibold text-ink-tertiary mb-2">
          {label}
        </Text>
      )}
      <View
        className="w-full h-[52px] flex-row items-center px-4 rounded-sm bg-background-surface"
        style={{
          borderWidth: focused ? 1.5 : 0,
          borderColor: focused ? colors.accent : "transparent",
        }}
      >
        <IconComponent
          size={18}
          color={focused ? colors.inkPrimary : colors.inkTertiary}
          strokeWidth={2}
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
          placeholderTextColor={colors.inkTertiary}
          className="flex-1 py-0 px-3 text-[15px] font-medium text-ink-primary h-full"
          style={rest.style}
        />
        {secure ? (
          <Pressable onPress={() => setShowSecret((v) => !v)} hitSlop={8}>
            {showSecret ? (
              <EyeOff size={18} color={colors.inkTertiary} strokeWidth={2} />
            ) : (
              <Eye size={18} color={colors.inkTertiary} strokeWidth={2} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default AuthInput;
