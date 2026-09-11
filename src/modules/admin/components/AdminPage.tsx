import React from "react";
import { View } from "react-native";
import { ApScrollView, ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";

export default function AdminPage({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const colors = useTheme();
  return (
    <ApScrollView contentContainerClassName="px-1 pb-12">
      <View className="mb-6 flex-row items-start justify-between">
        <View className="flex-1">
          <ApText size="2xl" font="bold" color={colors.textPrimary}>
            {title}
          </ApText>
          <ApText size="sm" color={colors.textMuted} className="mt-2">
            {description}
          </ApText>
        </View>
        {action}
      </View>
      {children}
    </ApScrollView>
  );
}
