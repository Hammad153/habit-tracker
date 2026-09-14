import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/src/modules/settings/context";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { dim: number; textSize: string; fontClass: string }> = {
  sm: { dim: 32, textSize: "text-[12px]", fontClass: "font-semibold" },
  md: { dim: 40, textSize: "text-[14px]", fontClass: "font-bold" },
  lg: { dim: 64, textSize: "text-[20px]", fontClass: "font-bold" },
  xl: { dim: 96, textSize: "text-[32px]", fontClass: "font-bold" },
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = "md",
  className = "",
}) => {
  const colors = useTheme();
  const { dim, textSize, fontClass } = sizeMap[size];

  const getInitials = (n: string) => {
    if (!n) return "HT";
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <View
      className={`rounded-pill bg-background-inverse items-center justify-center ${className}`}
      style={{ width: dim, height: dim }}
    >
      <Text className={`${textSize} ${fontClass} text-ink-inverse`}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

export default Avatar;
