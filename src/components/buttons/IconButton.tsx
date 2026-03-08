import React from "react";
import { View } from "react-native";
import { IconButton } from "react-native-paper";
import { ApText } from "../Text";

import { useTheme } from "@/src/modules/settings/context";

type Props = {
  icon: string;
  label: string;
  onPress: () => void;
};

export default function ApIconButton({ icon, label, onPress }: Props) {
  const colors = useTheme();
  return (
    <View className="items-center justify-center">
      <IconButton
        icon={icon}
        iconColor={colors.primary}
        size={24}
        onPress={onPress}
      />
      <ApText color={colors.textPrimary}>{label}</ApText>
    </View>
  );
}
