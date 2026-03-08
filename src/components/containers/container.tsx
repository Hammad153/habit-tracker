import React from "react";
import { Surface } from "react-native-paper";
import { useTheme } from "@/src/modules/settings/context";

interface Iprops {
  children: React.ReactNode;
  className?: string;
}

const ApContainer: React.FC<Iprops> = ({ children, className }) => {
  const colors = useTheme();
  return (
    <Surface
      style={{ backgroundColor: colors.background, flex: 1 }}
      className={`${className}`}
      elevation={0}
    >
      {children}
    </Surface>
  );
};

export default ApContainer;
