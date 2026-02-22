import React, { useState } from "react";
import { View, Pressable, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components/Text";
import { ApTheme } from "@/src/components/theme";
import { useToggleHabit, useUpdateHabit } from "@/hooks/useHabits";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import LogValueModal from "./LogValueModal";

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
  selectedDate: string;
  goal?: number;
  value?: number;
  unit?: string;
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
  selectedDate,
  goal = 1,
  value = 0,
  unit,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const { mutate: toggle } = useToggleHabit();
  const { mutate: update } = useUpdateHabit();
  const subText = subtitle || description;

  const progress = Math.min(value / goal, 1);
  const size = 48;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const handleToggle = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toggle({ id, date: selectedDate });
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalVisible(true);
  };

  const handleSaveValue = (newValue: number) => {
    toggle({ id, date: selectedDate, value: newValue });
  };

  const handleRestore = () => {
    update({ id, data: { isArchived: false } });
  };

  return (
    <>
      <Pressable
        onPress={variant === "toggle" ? handleToggle : undefined}
        onLongPress={variant === "toggle" ? handleLongPress : undefined}
        delayLongPress={500}>
        <View
          className="w-full flex-row items-center p-4 my-2 rounded-2xl"
          style={{
            backgroundColor: ApTheme.Color.surface,
            borderColor: ApTheme.Color.surfaceBorder,
            borderWidth: 1,
          }}>
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

          <View className="items-center justify-center">
            <Svg width={size} height={size} style={{ position: "absolute" }}>
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={strokeWidth}
              />
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={isCompleted ? ApTheme.Color.primary : iconColor}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
              />
            </Svg>
            <View
              className="w-10 h-10 rounded-xl items-center justify-center z-10"
              style={{ backgroundColor: iconBg }}>
              {customIconNode ? (
                customIconNode
              ) : (
                <Ionicons
                  name={icon as any}
                  size={20}
                  color={isCompleted ? ApTheme.Color.primary : iconColor}
                />
              )}
            </View>
          </View>

          <View
            className={`ml-4 flex-1 ${variant === "restore" ? "opacity-50" : ""}`}>
            <ApText
              size="lg"
              font="semibold"
              color={variant === "restore" ? ApTheme.Color.textMuted : "white"}
              numberOfLines={1}>
              {title}
            </ApText>
            {subText && (
              <ApText
                size="xs"
                font="medium"
                color={
                  isCompleted && variant === "toggle"
                    ? ApTheme.Color.primary
                    : ApTheme.Color.textMuted
                }>
                {subText}
              </ApText>
            )}
          </View>

          <View className="ml-2">
            {variant === "toggle" && (
              <View className="items-end">
                <ApText
                  size="xs"
                  font="bold"
                  color={isCompleted ? ApTheme.Color.primary : "white"}>
                  {value}/{goal}
                </ApText>
                {unit && (
                  <ApText size="xs" color={ApTheme.Color.textMuted}>
                    {unit}
                  </ApText>
                )}
              </View>
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
              <TouchableOpacity onPress={handleRestore}>
                <ApText size="sm" color={ApTheme.Color.textMuted}>
                  Restore
                </ApText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Pressable>

      <LogValueModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveValue}
        initialValue={value}
        goal={goal}
        unit={unit}
        title={title}
      />
    </>
  );
};

export default HabitCard;
