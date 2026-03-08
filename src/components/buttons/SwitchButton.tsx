import React from "react";
import { View } from "react-native";
import { Switch } from "react-native-paper";
import { useTheme } from "@/src/modules/settings/context";

interface ToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

const ToggleButton = ({ isEnabled, onToggle }: ToggleProps) => {
  const colors = useTheme();

  return (
    <View className="justify-center">
      <Switch
        value={isEnabled}
        onValueChange={onToggle}
        color={colors.primary}
      />
    </View>
  );
};

export default ToggleButton;
