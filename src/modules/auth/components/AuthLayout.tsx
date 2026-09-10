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
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                  style={{
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    elevation: 8,
                  }}
                >
                  <Ionicons
                    name="checkmark-done"
                    size={32}
                    color={colors.background}
                  />
                </View>
                <Text
                  className="text-2xl font-bold"
                  style={{ color: "#FFFFFF" }}
                >
                  Build habits that stick
                </Text>
                <Text
                  className="text-base mt-1"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Small steps, every single day.
                </Text>
              </View>
            </LinearGradient>
          </ImageBackground>

          {/* Form sheet */}
          <View
            className="flex-1 -mt-6 rounded-t-3xl px-6 pt-8 pb-10"
            style={{
              backgroundColor: colors.background,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 10,
            }}
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
