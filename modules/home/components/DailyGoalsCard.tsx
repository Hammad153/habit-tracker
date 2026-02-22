import React, { useRef, useEffect } from "react";
import { View, Dimensions } from "react-native";
import { ApText } from "@/src/components/Text";
import { ApTheme } from "@/src/components/theme";
import ConfettiCannon from "react-native-confetti-cannon";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

interface DailyGoalsCardProps {
  completed: number;
  total: number;
}

const DailyGoalsCard: React.FC<DailyGoalsCardProps> = ({
  completed,
  total,
}) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const confettiRef = useRef<any>(null);
  const prevPercentageRef = useRef(percentage);

  useEffect(() => {
    if (percentage === 100 && prevPercentageRef.current < 100) {
      confettiRef.current?.start();
    }
    prevPercentageRef.current = percentage;
  }, [percentage]);

  const size = 64;
  const strokeWidth = 6;
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
      className="rounded-[32px] p-6 shadow-2xl overflow-hidden"
      style={{
        backgroundColor: ApTheme.Color.surface,
        borderWidth: 1,
        borderColor: ApTheme.Color.surfaceBorder,
        shadowColor: ApTheme.Color.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
      }}>
      <View
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
        style={{ backgroundColor: ApTheme.Color.primary }}
      />

      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-1">
            <Ionicons
              name="flash"
              size={14}
              color={ApTheme.Color.primary}
              style={{ marginRight: 4 }}
            />
            <ApText size="xs" font="bold" color={ApTheme.Color.primary}>
              DAILY PROGRESS
            </ApText>
          </View>
          <ApText size="2xl" font="bold" color="white" className="mb-2">
            {completed}/{total} Habits
          </ApText>
          <ApText size="sm" color={ApTheme.Color.textSecondary} font="medium">
            {getMotivationalText()}
          </ApText>
        </View>

        <View className="items-center justify-center">
          <Svg width={size} height={size}>
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
              stroke={ApTheme.Color.primary}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </Svg>
          <View className="absolute">
            <ApText size="xs" font="bold" color="white">
              {Math.round(percentage)}%
            </ApText>
          </View>
        </View>
      </View>

      <ConfettiCannon
        count={200}
        origin={{ x: Dimensions.get("window").width / 2, y: -20 }}
        autoStart={false}
        ref={confettiRef}
        fadeOut={true}
      />
    </View>
  );
};

export default DailyGoalsCard;
