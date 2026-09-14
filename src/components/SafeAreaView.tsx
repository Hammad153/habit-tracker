import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { vars } from "nativewind";
import { useTheme } from "@/src/modules/settings/context";
import { getThemeVars } from "@/src/components/theme";

export const ApSafeAreaView: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  const colors = useTheme();

  return (
    <SafeAreaView
      className={`flex-1 ${colors.themeClass} ${colors.isDark ? "dark" : ""} ${className}`}
      style={[vars(getThemeVars(colors)), { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar style={colors.isDark ? "light" : "dark"} />
      {children}
    </SafeAreaView>
  );
};


