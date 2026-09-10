import React, { useRef, useEffect } from "react";
import { View, Dimensions } from "react-native";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/modules/settings/context";
import ConfettiCannon from "react-native-confetti-cannon";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

interface DailyGoalsCardProps {
  completed: number;
  total: number;
}

const DailyGoalsCard: React.FC<DailyGoalsCardProps> = ({
  completed,
  total,
}) => {
  const colors = useTheme();
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const confettiRef = useRef<any>(null);
  const prevPercentageRef = useRef(percentage);

  useEffect(() => {
    if (percentage === 100 && prevPercentageRef.current < 100) {
      confettiRef.current?.start();
    }
    prevPercentageRef.current = percentage;
  }, [percentage]);

  const size = 72;
  const strokeWidth = 7;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getMotivationalText = () => {
    if (total === 0) return "Add some habits to start your day!";
    if (percentage === 0) return "Ready to crush your goals?";
    if (percentage < 35) return "Good start! Keep it going.";
    if (percentage < 75) return "You're halfway there! Stay focused.";
    if (percentage < 100) return "Almost a perfect day! Just a bit more.";
    return "Amazing! You achieved all your goals.";
  };

  return (
    <View
      className="rounded-[24px] p-5 overflow-hidden flex-row items-center justify-between"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <View
        className="absolute -top-12 -right-6 w-32 h-32 rounded-full opacity-10"
        style={{ backgroundColor: colors.primary }}
      />

      <View className="flex-1 mr-4">
        <View className="flex-row items-center mb-1.5">
          <View
            className="w-5 h-5 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <Ionicons name="flash" size={12} color={colors.primary} />
          </View>
          <ApText size="xs" font="bold" color={colors.textSecondary} className="uppercase tracking-widest">
            Daily Progress
          </ApText>
        </View>
        <ApText
          size="2xl"
          font="bold"
          color={colors.textPrimary}
          className="mb-1"
        >
          {completed} / {total} Done
        </ApText>
        <ApText size="sm" color={colors.textMuted} font="medium">
          {getMotivationalText()}
        </ApText>
      </View>

      <View className="items-center justify-center relative">
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
              <Stop offset="1" stopColor={colors.success} stopOpacity="0.8" />
            </LinearGradient>
          </Defs>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.surfaceBorder}
            strokeOpacity={1}
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#grad)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        <View className="absolute inset-0 items-center justify-center">
          <ApText size="sm" font="bold" color={colors.textPrimary}>
            {Math.round(percentage)}%
          </ApText>
        </View>
      </View>

      <ConfettiCannon
        count={260}
        origin={{ x: Dimensions.get("window").width / 2, y: 0 }}
        autoStart={false}
        ref={confettiRef}
        fadeOut
        fallSpeed={1800}
        explosionSpeed={420}
        autoStartDelay={0}
      />
    </View>
  );
};

export default DailyGoalsCard;
