import React from "react";
import { ScrollView, ScrollViewProps, RefreshControl } from "react-native";
import { useTheme } from "@/src/context/SettingsContext";

export interface IProps extends ScrollViewProps {
  children: React.ReactNode;
  className?: string;
  contentContainerClassName?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const ApScrollView: React.FC<IProps> = ({
  children,
  className,
  contentContainerClassName,
  refreshing = false,
  onRefresh,
  ...props
}) => {
  const colors = useTheme();
  const refreshControl = onRefresh ? (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  ) : undefined;

  return (
    <ScrollView
      {...props}
      className={`px-4 py-2 ${className}`}
      style={{ backgroundColor: colors.background }}
      contentContainerClassName={contentContainerClassName}
      refreshControl={refreshControl}>
      {children}
    </ScrollView>
  );
};
