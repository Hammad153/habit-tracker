import React, { useMemo } from "react";
import { Platform, useWindowDimensions, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { vars } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/src/modules/settings/context";
import { getThemeVars } from "@/src/components/theme";

export const ApSafeAreaView: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  const colors = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width > 768;

  const viewportStyle = useMemo(() => {
    if (Platform.OS !== "web") return undefined;
    if (isDesktop) {
      return {
        width: "100%" as const,
        maxWidth: 440,
        height: "100%" as const,
        maxHeight: 920,
        alignSelf: "center" as const,
        borderRadius: 28,
        overflow: "hidden" as const,
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
        flex: 1,
      };
    }
    return {
      width: "100%" as const,
      maxWidth: "100%" as const,
      height: "100%" as const,
      alignSelf: "stretch" as const,
      flex: 1,
    };
  }, [isDesktop]);

  return (
    <SafeAreaView
      className={`flex-1 ${colors.themeClass} ${colors.isDark ? "dark" : ""} ${className}`}
      style={[
        vars(getThemeVars(colors)),
        { backgroundColor: colors.isGradient ? "transparent" : colors.background },
        viewportStyle,
      ]}
      edges={["top"]}
    >
      {colors.isGradient && (
        <LinearGradient
          colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
          locations={[0, 0.38, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      <StatusBar style={colors.isDark ? "light" : "dark"} />
      {children}
    </SafeAreaView>
  );
};
