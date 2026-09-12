import React from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "@/src/modules/settings/context";

export interface CardProps extends ViewProps {
  elevated?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  elevated = false,
  className = "",
  style,
  children,
  ...props
}) => {
  const colors = useTheme();

  if (elevated) {
    return (
      <View
        className={`bg-background-elevated rounded-lg p-4 ${className}`}
        style={[
          {
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
      className={`bg-background-surface rounded-lg p-4 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
};

export default Card;

export const ApCard = Card;
