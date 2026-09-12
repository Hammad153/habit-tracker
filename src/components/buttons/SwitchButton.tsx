import React from "react";
import { Switch, SwitchProps, Platform } from "react-native";
import { useTheme } from "@/src/modules/settings/context";

export interface SwitchButtonProps extends SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const SwitchButton: React.FC<SwitchButtonProps> = ({
  value,
  onValueChange,
  ...props
}) => {
  const colors = useTheme();

  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{
        false: colors.backgroundSurface2,
        true: colors.accent,
      }}
      thumbColor={colors.white}
      ios_backgroundColor={colors.backgroundSurface2}
      {...props}
    />
  );
};

export default SwitchButton;
