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
                  <Stack.Screen
                    name="forgot-password"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="reset-password"
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
                    name="habit-detail"
                    options={{
                      headerShown: false,
                      presentation: "card",
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
                  <Stack.Screen
                    name="notifications"
                    options={{
                      headerShown: false,
                      presentation: "modal",
                    }}
                  />
                  <Stack.Screen
                    name="add-budget"
                    options={{
                      headerShown: false,
                      presentation: "modal",
                    }}
                  />
                  <Stack.Screen
                    name="add-expense"
                    options={{
                      headerShown: false,
                      presentation: "modal",
                    }}
                  />
                  <Stack.Screen
                    name="add-income"
                    options={{
                      headerShown: false,
                      presentation: "modal",
                    }}
                  />
                  <Stack.Screen
                    name="budgets"
                    options={{
                      headerShown: false,
                      presentation: "card",
                    }}
                  />
                  <Stack.Screen
                    name="budget-detail"
                    options={{
                      headerShown: false,
                      presentation: "card",
                    }}
                  />
                  <Stack.Screen
                    name="expense-history"
                    options={{
                      headerShown: false,
                      presentation: "card",
                    }}
                  />
                  <Stack.Screen
                    name="category-breakdown"
                    options={{
                      headerShown: false,
                      presentation: "card",
                    }}
                  />
                  <Stack.Screen
                    name="add-plan-task"
                    options={{
                      headerShown: false,
                      presentation: "modal",
                    }}
                  />
                  <Stack.Screen
                    name="planner-calendar"
                    options={{
                      headerShown: false,
                      presentation: "card",
                    }}
                  />
                  <Stack.Screen
                    name="journal"
                    options={{
                      headerShown: false,
                      presentation: "card",
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
