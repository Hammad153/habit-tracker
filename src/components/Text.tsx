import React from "react";
import { Text, TextStyle, StyleProp, Pressable } from "react-native";

export interface IProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  numberOfLines?: number;
  textAlign?: "auto" | "left" | "right" | "center" | "justify";
  font?:
    | "thin"
    | "light"
    | "normal"
    | "medium"
    | "semibold"
    | "bold"
    | "extrabold";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  onPress?: () => void;
  html?: boolean;
  style?: StyleProp<TextStyle>;
}

const FONT_MAP: Record<NonNullable<IProps["font"]>, TextStyle["fontFamily"]> = {
  thin: "System",
  light: "System",
  normal: "System",
  medium: "System",
  semibold: "System",
  bold: "System",
  extrabold: "System",
};

const SIZE_MAP: Record<NonNullable<IProps["size"]>, number> = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
};

const WEIGHT_MAP: Record<
  NonNullable<IProps["font"]>,
  TextStyle["fontWeight"]
> = {
  thin: "100",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
};

import { useTheme } from "../context/SettingsContext";

export const ApText: React.FC<IProps> = ({
  children,
  color,
  numberOfLines,
  textAlign = "left",
  font = "normal",
  size = "base",
  onPress,
  html = false,
  style,
  className,
}) => {
  const colors = useTheme();
  const textColor = color || colors.textPrimary;

  if (html) {
    return (
      <Text
        className={className}
        numberOfLines={numberOfLines}
        style={[
          {
            color: textColor,
            textAlign,
            fontSize: SIZE_MAP[size],
            fontWeight: WEIGHT_MAP[font],
            fontFamily: FONT_MAP[font],
          },
          style,
        ]}>
        {children}
      </Text>
    );
  }

  const text = (
    <Text
      className={className}
      numberOfLines={numberOfLines}
      style={[
        {
          color: textColor,
          textAlign,
          fontSize: SIZE_MAP[size],
          fontWeight: WEIGHT_MAP[font],
          fontFamily: FONT_MAP[font],
        },
        style,
      ]}>
      {children}
    </Text>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{text}</Pressable>;
  }

  return text;
};
