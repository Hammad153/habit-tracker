import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Platform } from "react-native";
import { useTheme } from "@/src/modules/settings/context";
import "../../global.css";

/**
 * Center "Habits" tab — deliberately elevated action button with primary accent
 * fill and glow effect.
 */
const HabitsTabIcon = ({ focused }: { focused: boolean }) => {
  const colors = useTheme();
  return (
    <View
      className="items-center justify-center"
      style={{
        width: 54,
        height: 54,
        marginTop: -20,
        borderRadius: 27,
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: focused ? 0.5 : 0.3,
        shadowRadius: 10,
        elevation: focused ? 10 : 6,
        borderWidth: 3,
        borderColor: colors.background,
      }}
    >
      <Ionicons
        name={focused ? "checkmark-done-circle" : "checkmark-done-circle-outline"}
        size={28}
        color={colors.background}
      />
    </View>
  );
};

const TabLayout = () => {
  const colors = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceBorder,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 82 : 72,
          paddingBottom: Platform.OS === "ios" ? 22 : 12,
          paddingTop: 8,
          elevation: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "today" : "today-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="daily-plan"
        options={{
          title: "Plan",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      {/* CENTER — primary action tab */}
      <Tabs.Screen
        name="habits"
        options={{
          title: "Habits",
          tabBarLabelStyle: { fontWeight: "700", marginTop: -2, fontSize: 11 },
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <HabitsTabIcon focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "stats-chart" : "stats-chart-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden tabs */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="journal" options={{ href: null }} />
      <Tabs.Screen name="budget" options={{ href: null }} />
      <Tabs.Screen name="awards" options={{ href: null }} />
    </Tabs>
  );
};

export default TabLayout;

