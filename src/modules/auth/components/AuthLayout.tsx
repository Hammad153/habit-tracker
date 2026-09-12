import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { CheckSquare } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";

interface IProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export const AuthLayout: React.FC<IProps> = ({
  title,
  subtitle,
  children,
  footer,
}) => {
  const colors = useTheme();

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 80,
            paddingBottom: 40,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Mark */}
          <View className="w-14 h-14 rounded-md bg-background-inverse items-center justify-center mb-7">
            <CheckSquare size={28} color={colors.inkInverse} strokeWidth={2} />
          </View>

          <View className="mb-7">
            <Text className="text-[26px] font-bold text-ink-primary">
              {title}
            </Text>
            <Text className="text-[14px] text-ink-secondary mt-1.5">
              {subtitle}
            </Text>
          </View>

          <View className="w-full">
            {children}
          </View>

          <View className="flex-row justify-center items-center mt-6">
            {footer}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AuthLayout;
