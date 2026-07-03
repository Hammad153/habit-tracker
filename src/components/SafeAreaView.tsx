import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export const ApSafeAreaView: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <SafeAreaView className={`bg-black flex-1 ${className}`} edges={["top"]}>
      {children}
    </SafeAreaView>
  );
};
