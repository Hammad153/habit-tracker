import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import "../global.css";
import { ApSafeAreaView, ToastProvider } from "@/src/components";
import ApProvider from "@/src/provider";
import ApRouteAuthGuard from "@/src/guard";

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <ApProvider>
          <ToastProvider>
            <ApRouteAuthGuard>
              <ApSafeAreaView>
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="signup"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
                  <Stack.Screen
                    name="timeline"
                    options={{ headerShown: false }}
                  />
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
                    name="edit-habit"
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
                  <Stack.Screen
                    name="settings/change-password"
                    options={{
                      headerShown: false,
                      presentation: "card",
                    }}
                  />
                  <Stack.Screen
                    name="subscription"
                    options={{
                      headerShown: false,
                      presentation: "modal",
                    }}
                  />
                  <Stack.Screen
                    name="templates"
                    options={{
                      headerShown: false,
                      presentation: "modal",
                    }}
                  />
                  <Stack.Screen
                    name="export"
                    options={{
                      headerShown: false,
                      presentation: "modal",
                    }}
                  />
                  <Stack.Screen
                    name="analytics"
                    options={{
                      headerShown: false,
                      presentation: "modal",
                    }}
                  />
                </Stack>
                <StatusBar style="auto" />
              </ApSafeAreaView>
            </ApRouteAuthGuard>
          </ToastProvider>
        </ApProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
