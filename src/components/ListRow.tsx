import React from "react";
import { View, Text, Pressable, ViewProps } from "react-native";
import { useTheme } from "@/src/modules/settings/context";
import { LucideIcon } from "lucide-react-native";

export type CategoryKey = "rose" | "amber" | "mint" | "violet" | "sky" | "sand";

export interface ListRowProps extends ViewProps {
  title: string;
  subLabel?: string;
  subtitle?: string;
  icon?: LucideIcon | React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  left?: React.ReactNode;
  categoryKey?: CategoryKey;
  iconBg?: string;
  iconColor?: string;
  trailingControl?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
  className?: string;
  isCompleted?: boolean;
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subLabel,
  subtitle,
  icon: Icon,
  left,
  categoryKey = "mint",
  iconBg,
  iconColor,
  trailingControl,
  right,
  onPress,
  isLast = false,
  className = "",
  isCompleted = false,
  style,
  ...props
}) => {
  const displaySubtitle = subLabel || subtitle;
  const trailing = trailingControl || right;
  const colors = useTheme();

  const categoryTokens = colors.category?.[categoryKey] || {
    bg: colors.accentSoft,
    ink: colors.accent,
  };

  const bgStyle = iconBg ? { backgroundColor: iconBg } : undefined;
  const computedIconColor = iconColor || categoryTokens.ink;

  const content = (
    <View
      className={`flex-row items-center gap-3 py-3 ${isLast ? "" : "border-b border-border"} ${className}`}
      style={style}
      {...props}
    >
      {left ? left : Icon ? (
        <View
          className={`w-10 h-10 rounded-md items-center justify-center bg-category-${categoryKey}-bg ${isCompleted ? "opacity-60" : ""}`}
          style={bgStyle}
        >
          <Icon size={20} color={computedIconColor} strokeWidth={2} />
        </View>
      ) : null}
      <View className="flex-1 justify-center">
        <Text
          className={`text-[15px] leading-[22px] font-medium ${
            isCompleted ? "line-through text-ink-tertiary" : "text-ink-primary"
          }`}
          style={isCompleted ? { textDecorationLine: "line-through" } : undefined}
          numberOfLines={1}
        >
          {title}
        </Text>
        {displaySubtitle ? (
          <Text
            className={`text-[13.5px] leading-[20px] font-medium mt-0.5 ${
              isCompleted ? "text-ink-disabled" : "text-ink-secondary"
            }`}
            numberOfLines={1}
          >
            {displaySubtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
};

export default ListRow;

export const ApListRow = ListRow;
