import React from "react";
import { View } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { ApText } from "@/src/components/Text";
import { ApTheme } from "@/src/components/theme";
import { Ionicons } from "@expo/vector-icons";

const CHART_DATA_POINTS = [25, 45, 35, 60, 50, 75, 85];
const LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CompletionChart = () => {
  return (
    <View
      className="p-4 rounded-3xl mb-6 relative overflow-hidden"
      style={{
        backgroundColor: ApTheme.Color.surface,
        borderColor: ApTheme.Color.surfaceBorder,
        borderWidth: 1,
        minHeight: 220,
      }}
    >
      <View className="flex-row justify-between items-start mb-8 z-10">
        <View>
          <ApText size="sm" color={ApTheme.Color.textMuted} className="mb-1">
            Overall Completion
          </ApText>
          <View className="flex-row items-center">
            <ApText size="3xl" font="bold" color="white" className="mr-2">
              82%
            </ApText>
            <View className="bg-green-500/20 px-2 py-0.5 rounded-full">
              <ApText size="xs" color="#22C55E" font="bold">
                +5% this week
              </ApText>
            </View>
          </View>
        </View>
        <Ionicons
          name="ellipsis-horizontal"
          size={20}
          color={ApTheme.Color.textMuted}
        />
      </View>

      {/* Chart */}
      <View
        className="absolute bottom-0 left-0 right-0 h-40 w-full"
        style={{ paddingBottom: 30 }}
      >
        <Svg
          height="100%"
          width="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <Defs>
            <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0"
                stopColor={ApTheme.Color.primary}
                stopOpacity="0.5"
              />
              <Stop
                offset="1"
                stopColor={ApTheme.Color.primary}
                stopOpacity="0"
              />
            </LinearGradient>
          </Defs>
          <Path
            d="M0 100 L0 80 C 10 80, 20 60, 30 65 S 50 50, 60 55 S 80 30, 100 20 L 100 100 Z"
            fill="url(#gradient)"
          />
          <Path
            d="M0 80 C 10 80, 20 60, 30 65 S 50 50, 60 55 S 80 30, 100 20"
            fill="none"
            stroke={ApTheme.Color.primary}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* X-Axis Labels */}
      <View className="flex-row justify-between absolute bottom-4 left-4 right-4">
        {LABELS.map((label, index) => (
          <ApText
            key={index}
            size="xs"
            color={ApTheme.Color.textMuted}
            style={{ fontSize: 10 }}
          >
            {label}
          </ApText>
        ))}
      </View>
    </View>
  );
};

export default CompletionChart;
