import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { ApSafeAreaView } from "@/src/components";
import ApProvider from "@/src/provider";
import ApRouteAuthGuard from "@/src/guard";

const RootLayout = () => {
  return (
    <ApProvider>
      <ApRouteAuthGuard>
        <ApSafeAreaView>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="timeline" options={{ headerShown: false }} />
            <Stack.Screen
              name="manage-habits"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="create-habit"
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="settings/appearance"
              options={{
                headerShown: false,
                presentation: "card",
              }}
            />
            <Stack.Screen
              name="settings/sounds"
              options={{
                headerShown: false,
                presentation: "card",
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ApSafeAreaView>
      </ApRouteAuthGuard>
    </ApProvider>
  );
};

export default RootLayout;
