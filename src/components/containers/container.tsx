import React from "react";
import { View, StyleSheet } from "react-native";
import { vars } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/src/modules/settings/context";
import { getThemeVars } from "@/src/components/theme";

interface Iprops {
  children: React.ReactNode;
  className?: string;
}

const ApContainer: React.FC<Iprops> = ({ children, className = "" }) => {
  const colors = useTheme();

  return (
    <View
      style={[
        vars(getThemeVars(colors)),
        { backgroundColor: colors.isGradient ? "transparent" : colors.background },
      ]}
      className={`flex-1 ${colors.themeClass} ${colors.isDark ? "dark" : ""} ${className}`}
    >
      {colors.isGradient && (
        <LinearGradient
          colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
          locations={[0, 0.38, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
};

export default ApContainer;

