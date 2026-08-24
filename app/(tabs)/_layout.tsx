import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { useTheme } from "@/src/modules/settings/context";
import "../../global.css";

/**
 * Center "Habits" tab — deliberately louder than the rest: raised accent
 * pill + glow so the product's core action reads first.
 */
const HabitsTabIcon = ({ focused, color }: { focused: boolean; color: string }) => {
  const colors = useTheme();
  return (
    <View
      className="items-center justify-center"
      style={{
        width: 52,
        height: 52,
        marginTop: -18,
        borderRadius: 26,
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: focused ? 0.45 : 0.25,
        shadowRadius: 8,
        elevation: focused ? 8 : 5,
        borderWidth: 3,
        borderColor: colors.surface,
      }}
    >
      <Ionicons
        name={focused ? "checkbox" : "checkbox-outline"}
        size={26}
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
          height: 74,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              size={24}
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
              size={24}
              color={color}
            />
          ),
        }}
      />
      {/* CENTER — core action */}
      <Tabs.Screen
        name="habits"
        options={{
          title: "Habits",
          tabBarLabelStyle: { fontWeight: "700", marginTop: -2 },
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <HabitsTabIcon focused={focused} color={colors.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={24}
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
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden tabs — accessible via the More screen but not shown in the bar */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="journal" options={{ href: null }} />
      <Tabs.Screen name="progress" options={{ href: null }} />
      <Tabs.Screen name="awards" options={{ href: null }} />
    </Tabs>
  );
};

export default TabLayout;
