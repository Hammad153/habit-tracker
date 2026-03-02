import React from "react";
import { View } from "react-native";
import { useTheme } from "@/src/context/SettingsContext";

interface Iprops {
  children: React.ReactNode;
  className?: string;
}

const ApContainer: React.FC<Iprops> = ({ children, className }) => {
  const colors = useTheme();
  return (
    <View
      style={{ backgroundColor: colors.background }}
      className={`flex-1 ${className}`}
    >
      {children}
    </View>
  );
};

export default ApContainer;
