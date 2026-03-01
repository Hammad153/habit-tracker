import React, { useState } from "react";
import { View, Pressable, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components/Text";
import { useTheme, useSettings } from "@/src/context/SettingsContext";
import { useFeedback } from "@/src/utils/feedback";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import LogValueModal from "./LogValueModal";
import { useToggleHabit, useUpdateHabit } from "@/hooks/useHabits";

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
  const colors = useTheme();
  const { triggerHaptic } = useFeedback();

  const subText = subtitle || description;

  const progress = Math.min(value / goal, 1);
  const size = 48;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const handleToggle = () => {
    triggerHaptic(Haptics.NotificationFeedbackType.Success);
    toggle({ id, date: selectedDate });
  };

  const handleLongPress = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
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
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
            borderWidth: 1,
          }}>
          {variant === "edit" && (
            <View className="mr-4">
              <Ionicons
                name="grid"
                size={20}
                color={colors.textMuted}
                style={{ opacity: 0.5 }}
              />
            </View>
          )}
          {variant === "restore" && (
            <View className="mr-4 ml-1">
              <Ionicons
                name="lock-closed"
                size={20}
                color={colors.textMuted}
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
                stroke={isCompleted ? colors.primary : iconColor}
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
                  color={isCompleted ? colors.primary : iconColor}
                />
              )}
            </View>
          </View>

          <View
            className={`ml-4 flex-1 ${variant === "restore" ? "opacity-50" : ""}`}>
            <ApText
              size="lg"
              font="semibold"
              color={variant === "restore" ? colors.textMuted : "white"}
              numberOfLines={1}>
              {title}
            </ApText>
            {subText && (
              <ApText
                size="xs"
                font="medium"
                color={
                  isCompleted && variant === "toggle"
                    ? colors.primary
                    : colors.textMuted
                }>
                {subText}
              </ApText>
            )}
          </View>

          <View className="ml-2">
            {variant === "toggle" && (
              <View className="flex-row items-center">
                <View className="items-end mr-3">
                  <ApText
                    size="xs"
                    font="bold"
                    color={isCompleted ? colors.primary : "white"}>
                    {value}/{goal}
                  </ApText>
                  {unit && (
                    <ApText size="xs" color={colors.textMuted}>
                      {unit}
                    </ApText>
                  )}
                </View>
                <TouchableOpacity
                  onPress={handleToggle}
                  onLongPress={handleLongPress}
                  delayLongPress={500}
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: isCompleted
                      ? colors.primary
                      : "rgba(255,255,255,0.05)",
                    borderWidth: 1,
                    borderColor: isCompleted
                      ? colors.primary
                      : colors.surfaceBorder,
                  }}>
                  <Ionicons
                    name={isCompleted ? "checkmark" : "add"}
                    size={22}
                    color={isCompleted ? "#000" : colors.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
            {variant === "edit" && (
              <TouchableOpacity hitSlop={10}>
                <Ionicons name="pencil" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
            {variant === "restore" && (
              <TouchableOpacity onPress={handleRestore}>
                <ApText size="sm" color={colors.textMuted}>
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
