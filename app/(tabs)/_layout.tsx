import React from "react";
import { Tabs } from "expo-router";
import { FloatingTabBar } from "@/src/components/FloatingTabBar";
import "../../global.css";

const TabLayout = () => {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
        }}
      />
      <Tabs.Screen
        name="daily-plan"
        options={{
          title: "Daily Plan",
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
        }}
      />

      {/* Hidden tabs */}
      <Tabs.Screen name="habits" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="journal" options={{ href: null }} />
      <Tabs.Screen name="budget" options={{ href: null }} />
      <Tabs.Screen name="awards" options={{ href: null }} />
    </Tabs>
  );
};

export default TabLayout;


