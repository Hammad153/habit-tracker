import React from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const ApSafeAreaView: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <SafeAreaView
      className={`bg-black flex-1 ${className}`}
      style={Platform.OS === "web" ? webViewportStyle : undefined}
      edges={["top"]}
    >
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
