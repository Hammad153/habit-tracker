import React from "react";
import {
  View,
  Text,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/modules/settings/context";

const HERO_IMAGE = require("@/assets/images/calm.png");
const HERO_HEIGHT = Math.round(Dimensions.get("window").height * 0.4);

interface IProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const AuthLayout: React.FC<IProps> = ({
  title,
  subtitle,
  children,
  footer,
}) => {
  const colors = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <ImageBackground
            source={HERO_IMAGE}
            style={{ height: HERO_HEIGHT, width: "100%" }}
            resizeMode="cover"
          >
            {/* Scrim for brand legibility + fade into the form sheet */}
            <LinearGradient
              colors={[
                "rgba(0,0,0,0.35)",
                "rgba(0,0,0,0.05)",
                colors.background,
              ]}
              locations={[0, 0.5, 1]}
              style={{ flex: 1, justifyContent: "flex-end" }}
            >
              <View className="px-6 pb-10">
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Ionicons
                    name="checkmark-done"
                    size={30}
                    color={colors.background}
                  />
                </View>
                <Text className="text-green-500 text-2xl font-bold">
                  Build habits that stick
                </Text>
                <Text className="text-green-500/80 text-base mt-1">
                  Small steps, every single day.
                </Text>
              </View>
            </LinearGradient>
          </ImageBackground>

          {/* Form sheet */}
          <View
            className="flex-1 -mt-6 rounded-t-3xl px-6 pt-8 pb-10"
            style={{ backgroundColor: colors.background }}
          >
            <View className="mb-8">
              <Text
                className="text-3xl font-bold mb-2"
                style={{ color: colors.textPrimary }}
              >
                {title}
              </Text>
              <Text
                className="text-base"
                style={{ color: colors.textSecondary }}
              >
                {subtitle}
              </Text>
            </View>

            {children}

            <View className="flex-row justify-center mt-8">{footer}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AuthLayout;
