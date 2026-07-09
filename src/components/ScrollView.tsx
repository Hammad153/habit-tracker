import React from "react";
import { ScrollView, ScrollViewProps, RefreshControl } from "react-native";
import { useTheme } from "@/src/modules/settings/context";

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
  refreshControl,
  ...props
}) => {
  const colors = useTheme();
  // An explicitly passed refreshControl wins; otherwise build one from the
  // refreshing/onRefresh shorthand. Previously this prop was swallowed by the
  // spread, silently disabling pull-to-refresh for callers that passed it.
  const control =
    refreshControl ??
    (onRefresh ? (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={colors.textMuted}
        colors={[colors.primary]}
      />
    ) : undefined);

  return (
    <ScrollView
      {...props}
      className={`px-4 py-2 ${className ?? ""}`}
      style={{ backgroundColor: colors.background }}
      contentContainerClassName={contentContainerClassName}
      refreshControl={control}>
      {children}
    </ScrollView>
  );
};
