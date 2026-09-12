import React from "react";
import { View, Text, Pressable } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { Home, Calendar, Grid, Plus } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 3-pill capsule progress icon matching the reference design
const ProgressIcon: React.FC<{ color: string }> = ({ color }) => {
  return (
    <View
      style={{
        width: 22,
        height: 20,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 3,
        paddingBottom: 1,
      }}
    >
      <View
        style={{
          width: 4.5,
          height: 13,
          borderRadius: 2.5,
          borderWidth: 1.6,
          borderColor: color,
        }}
      />
      <View
        style={{
          width: 4.5,
          height: 18,
          borderRadius: 2.5,
          borderWidth: 1.6,
          borderColor: color,
        }}
      />
      <View
        style={{
          width: 4.5,
          height: 11,
          borderRadius: 2.5,
          borderWidth: 1.6,
          borderColor: color,
        }}
      />
    </View>
  );
};

interface TabConfig {
  name: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color: string; strokeWidth?: number }>;
}

const TAB_CONFIGS: TabConfig[] = [
  { name: "index", label: "Home", icon: Home },
  { name: "progress", label: "Progress", icon: ProgressIcon },
  { name: "daily-plan", label: "Daily Plan", icon: Calendar },
  { name: "more", label: "More", icon: Grid },
];

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(16, insets.bottom > 0 ? insets.bottom : 16);

  return (
    <View
      className="absolute left-4 right-4 flex-row items-center justify-between"
      style={{
        bottom: bottomOffset,
      }}
      pointerEvents="box-none"
    >
      {/* 4-Tab Pill Bar */}
      <View
        className="flex-1 flex-row items-center justify-around rounded-full border"
        style={{
          height: 58,
          backgroundColor: colors.surfaceElevated || colors.background,
          borderColor: colors.border,
          shadowColor: colors.inkPrimary,
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
          paddingHorizontal: 4,
        }}
      >
        {TAB_CONFIGS.map((tab) => {
          const route = state.routes.find((r) => r.name === tab.name);
          const isFocused = state.routes[state.index]?.name === tab.name;
          const IconComponent = tab.icon;

          const onPress = () => {
            if (!route) {
              navigation.navigate(tab.name);
              return;
            }

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            if (route) {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            }
          };

          return (
            <Pressable
              key={tab.name}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={tab.label}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center justify-center py-1 active:opacity-75"
              hitSlop={4}
            >
              {/* Capsule highlight behind active icon */}
              <View
                className="items-center justify-center"
                style={{
                  width: 50,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: isFocused
                    ? colors.surface2 || colors.backgroundSurface2
                    : "transparent",
                }}
              >
                <IconComponent
                  size={19}
                  color={isFocused ? colors.inkPrimary : colors.inkTertiary}
                  strokeWidth={2}
                />
              </View>

              {/* Label */}
              <Text
                numberOfLines={1}
                className="text-[10px] tracking-tight mt-0.5"
                style={{
                  color: isFocused ? colors.inkPrimary : colors.inkTertiary,
                  fontWeight: isFocused ? "600" : "500",
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Standalone Circular Plus Button to Add New Habit */}
      <Pressable
        onPress={() => router.push("/create-habit")}
        accessibilityRole="button"
        accessibilityLabel="Add new habit"
        className="items-center justify-center rounded-full active:opacity-80 active:scale-95"
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: colors.inkPrimary,
          marginLeft: 10,
          shadowColor: colors.inkPrimary,
          shadowOpacity: 0.16,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 4 },
          elevation: 5,
        }}
      >
        <Plus size={24} color={colors.inkInverse} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
};

export default FloatingTabBar;
