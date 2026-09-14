import React from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "@/src/modules/settings/context";

export interface CardProps extends ViewProps {
  elevated?: boolean;
  noPadding?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  elevated = false,
  noPadding = false,
  className = "",
  style,
  children,
  ...props
}) => {
  const colors = useTheme();
  const hasCustomPadding = /\b(p-[0-9]|px-[0-9]|py-[0-9]|p-0)\b/.test(className);
  const paddingClass = noPadding || hasCustomPadding ? "" : "p-4";

  if (elevated) {
    return (
      <View
        className={`rounded-2xl border ${paddingClass} ${className}`}
        style={[
          {
            backgroundColor: colors.surfaceElevated || colors.backgroundElevated,
            borderColor: colors.surfaceBorder,
            shadowColor: colors.inkPrimary,
            shadowOpacity: 0.04,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 1,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      className={`rounded-2xl border ${paddingClass} ${className}`}
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.surfaceBorder,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

export default Card;

export const ApCard = Card;
