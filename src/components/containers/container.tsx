import React from "react";
import { View } from "react-native";
import { vars } from "nativewind";
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
      style={[vars(getThemeVars(colors)), { backgroundColor: colors.background }]}
      className={`flex-1 ${colors.themeClass} ${colors.isDark ? "dark" : ""} ${className}`}
    >
      {children}
    </View>
  );
};

export default ApContainer;

