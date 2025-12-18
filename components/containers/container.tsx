import React from "react";
import { View } from "react-native";
import { ApTheme } from "../theme";

interface Iprops {
  children: React.ReactNode;
  className?: string;
}

const ApContainer: React.FC<Iprops> = ({ children, className }) => {
  return (
    <View
      style={{ backgroundColor: ApTheme.Color.container }}
      className={`${className} pt-12`}
    >
      {children}
    </View>
  );
};

export default ApContainer;
