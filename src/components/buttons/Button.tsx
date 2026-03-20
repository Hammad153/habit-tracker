import React from "react";
import { View, Pressable } from "react-native";
import { ApText } from "../Text";

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
  return (
    <View className={`${className} p-2 w-[200px] bg-primary my-2 rounded-lg`}>
      <Pressable onPress={onPress} className={`items-center justify-center`}>
        <ApText className={`text-white text-center text-2xl ${labelClassname}`}>
          {label}
        </ApText>
      </Pressable>
    </View>
  );
}
