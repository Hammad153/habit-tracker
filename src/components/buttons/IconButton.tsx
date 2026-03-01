import React from "react";
import { Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ApText } from "../Text";

import { useTheme } from "@/src/context/SettingsContext";

type Props = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
};

export default function ApIconButton({ icon, label, onPress }: Props) {
  const colors = useTheme();
  return (
    <Pressable onPress={onPress}>
      <MaterialIcons name={icon} size={24} color={colors.primary} />
      <ApText color={colors.textPrimary}>{label}</ApText>
    </Pressable>
  );
}
