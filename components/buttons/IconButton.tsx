import React from "react";
import { Pressable } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ApText } from "../Text";

type Props = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
};

export default function IconButton({ icon, label, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <MaterialIcons name={icon} size={24} color="#fff" />
      <ApText>{label}</ApText>
    </Pressable>
  );
}
