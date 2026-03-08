import React from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";
import { useTheme } from "@/src/modules/settings/context";

type Props = {
  label: string;
  onPress?: () => void;
  className?: string;
  labelClassname?: string;
  containerClassName?: string;
};

export default function ApButton({
  label,
  onPress,
  className,
  labelClassname,
}: Props) {
  const colors = useTheme();
  return (
    <View className={`${className} my-2 w-[200px]`}>
      <Button
        mode="contained"
        onPress={onPress}
        buttonColor={colors.primary}
        textColor="#ffffff"
        labelStyle={{ fontSize: 18, paddingVertical: 4 }}
        className="rounded-lg"
      >
        {label}
      </Button>
    </View>
  );
}
