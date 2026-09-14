import React from "react";
import { Platform } from "react-native";
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
      style={[
        vars(getThemeVars(colors)),
        { backgroundColor: colors.background },
        Platform.OS === "web" ? webViewportStyle : undefined,
      ]}
      edges={["top"]}
    >
      <StatusBar style={colors.isDark ? "light" : "dark"} />
      {children}
    </SafeAreaView>
  );
};

const webViewportStyle = {
  width: "100%" as const,
  maxWidth: 430,
  height: "100%" as const,
  alignSelf: "center" as const,
  overflow: "hidden" as const,
};
