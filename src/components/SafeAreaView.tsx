import React from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/context/SettingsContext";

export const ApSafeAreaView: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const colors = useTheme();
  return (
    <SafeAreaView
      className={`${
        Platform.OS === "android" ? "pt-2" : ""
      } flex-1 ${className}`}
      style={{ backgroundColor: colors.background }}>
      {children}
    </SafeAreaView>
  );
};
