import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ApTheme } from "@/components/theme";
import "../../global.css";
import { View, Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: ApTheme.Color.surface,
          borderTopColor: ApTheme.Color.surfaceBorder,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: ApTheme.Color.primary,
        tabBarInactiveTintColor: ApTheme.Color.textSecondary,
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
        name="habits"
        options={{
          title: "Habits",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "checkbox" : "checkbox-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, focused }) => (
            <View className="absolute bottom-1 items-center">
              <View
                className="bg-primary rounded-full w-[60px] h-[60px] justify-center items-center"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 8,
                }}
              >
                <Ionicons
                  name={focused ? "stats-chart-sharp" : "stats-chart-outline"}
                  size={28}
                  color="#fff"
                />
              </View>
              <Text
                numberOfLines={1}
                style={{
                  color: focused
                    ? ApTheme.Color.primary
                    : ApTheme.Color.textSecondary,
                  fontSize: 12,
                  fontWeight: focused ? "600" : "400",
                  marginTop: 4,
                }}
              >
                Progress
              </Text>
            </View>
          ),
          tabBarLabel: "",
        }}
      />
      <Tabs.Screen
        name="awards"
        options={{
          title: "Awards",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "trophy-sharp" : "trophy-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-sharp" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
