import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { ApSafeAreaView } from "@/components/SafeAreaView";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ApSafeAreaView>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
        </Stack>
        <StatusBar style="light" />
      </ApSafeAreaView>
    </QueryClientProvider>
  );
}
