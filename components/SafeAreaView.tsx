import React from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ApTheme } from "./theme";

export const ApSafeAreaView: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <SafeAreaView
      className={`${
        Platform.OS === "android" ? "pt-2" : ""
      } flex-1 ${className}`}
      style={{ backgroundColor: ApTheme.Color.background }}
    >
      {children}
    </SafeAreaView>
  );
};
