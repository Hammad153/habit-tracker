import React, { useState } from "react";
import { View, Pressable, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ToggleButton from "@/components/buttons/SwitchButton";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";
import { useToggleHabit } from "@/hooks/useHabits";

interface HabitCardProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  iconBg?: string;
  customIconNode?: React.ReactNode;
  variant?: "toggle" | "edit" | "restore";
  isCompleted?: boolean;
  onRefresh?: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({
  id,
  title,
  subtitle,
  description,
  icon,
  iconColor = "#fff",
  iconBg = "rgba(255,255,255,0.1)",
  customIconNode,
  variant = "toggle",
  isCompleted = false,
  onRefresh,
}) => {
  const { mutate: toggle } = useToggleHabit();
  const subText = subtitle || description;

  const toggleHabit = () => {
    const today = new Date().toISOString().split("T")[0];
    toggle({ id, date: today });
  };

  return (
    <Pressable onPress={variant === "toggle" ? toggleHabit : undefined}>
      <View
        className="w-full flex-row items-center p-4 my-2 rounded-2xl"
        style={{
          backgroundColor: ApTheme.Color.surface,
          borderColor: ApTheme.Color.surfaceBorder,
          borderWidth: 1,
        }}
      >
        {variant === "edit" && (
          <View className="mr-4">
            <Ionicons
              name="grid"
              size={20}
              color={ApTheme.Color.textMuted}
              style={{ opacity: 0.5 }}
            />
          </View>
        )}
        {variant === "restore" && (
          <View className="mr-4 ml-1">
            <Ionicons
              name="lock-closed"
              size={20}
              color={ApTheme.Color.textMuted}
              style={{ opacity: 0.5 }}
            />
          </View>
        )}

        <View
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          {customIconNode ? (
            customIconNode
          ) : (
            <Ionicons name={icon as any} size={24} color={iconColor} />
          )}
        </View>

        <View
          className={`ml-4 flex-1 ${variant === "restore" ? "opacity-50" : ""}`}
        >
          <ApText
            size="lg"
            font="semibold"
            color={variant === "restore" ? ApTheme.Color.textMuted : "white"}
            numberOfLines={1}
          >
            {title}
          </ApText>
          {subText && (
            <ApText
              size="xs"
              font="medium"
              color={
                isCompleted && variant === "toggle"
                  ? ApTheme.Color.primary
                  : ApTheme.Color.textSecondary
              }
            >
              {subText}
            </ApText>
          )}
        </View>

        <View className="ml-2">
          {variant === "toggle" && (
            <ToggleButton isEnabled={isCompleted} onToggle={toggleHabit} />
          )}
          {variant === "edit" && (
            <TouchableOpacity hitSlop={10}>
              <Ionicons
                name="pencil"
                size={20}
                color={ApTheme.Color.textMuted}
              />
            </TouchableOpacity>
          )}
          {variant === "restore" && (
            <TouchableOpacity>
              <ApText size="sm" color={ApTheme.Color.textMuted}>
                Restore
              </ApText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default HabitCard;
