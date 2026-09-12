import React from "react";
import { View, Pressable } from "react-native";
import { Lock, Award, Flame, Target, Trophy, Sparkles } from "lucide-react-native";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/modules/settings/context";

interface BadgeCardProps {
  title: string;
  icon: string;
  description: string;
  isLocked?: boolean;
  earnedAt?: string;
  onPress?: () => void;
}

const getBadgeIcon = (iconName: string) => {
  const lower = (iconName || "").toLowerCase();
  if (lower.includes("flame") || lower.includes("fire") || lower.includes("streak")) return Flame;
  if (lower.includes("target") || lower.includes("goal")) return Target;
  if (lower.includes("trophy") || lower.includes("cup")) return Trophy;
  if (lower.includes("sparkle") || lower.includes("star")) return Sparkles;
  return Award;
};

const BadgeCard: React.FC<BadgeCardProps> = ({
  title,
  icon,
  description,
  isLocked = false,
  earnedAt,
  onPress,
}) => {
  const colors = useTheme();
  const IconComponent = isLocked ? Lock : getBadgeIcon(icon);

  return (
    <Pressable
      onPress={onPress}
      className="items-center p-3 rounded-xl mb-3 flex-1"
      style={{
        backgroundColor: isLocked ? colors.surface2 : colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        opacity: isLocked ? 0.5 : 1,
        minHeight: 120,
      }}
    >
      <View
        className="w-11 h-11 rounded-full items-center justify-center mb-2"
        style={{
          backgroundColor: isLocked ? colors.surfaceInactive : colors.accentLight,
        }}
      >
        <IconComponent
          size={20}
          color={isLocked ? colors.textMuted : colors.primary}
        />
      </View>
      <ApText
        size="xs"
        font="semibold"
        color={colors.textPrimary}
        textAlign="center"
        numberOfLines={1}
      >
        {title}
      </ApText>
      <ApText
        size="xs"
        color={colors.textMuted}
        textAlign="center"
        numberOfLines={2}
        className="mt-1"
        style={{ fontSize: 11 }}
      >
        {isLocked ? description : earnedAt ? new Date(earnedAt).toLocaleDateString() : description}
      </ApText>
    </Pressable>
  );
};

export default BadgeCard;
