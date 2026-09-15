import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Slot, usePathname, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ApContainer, ApText } from "@/src/components";
import { useAuthState } from "@/src/modules/auth/context";
import { useTheme } from "@/src/modules/settings/context";

const menu = [
  { path: "/admin", label: "Dashboard", icon: "grid-outline" },
  { path: "/admin/users", label: "Users", icon: "people-outline" },
  { path: "/admin/habits", label: "Habits", icon: "checkmark-circle-outline" },
  { path: "/admin/analytics", label: "Analytics", icon: "bar-chart-outline" },
  { path: "/admin/shop", label: "Shop & Economy", icon: "cart-outline" },
  { path: "/admin/settings", label: "Settings", icon: "settings-outline" },
  {
    path: "/admin/audit-logs",
    label: "Audit Logs",
    icon: "document-text-outline",
  },
  {
    path: "/admin/notifications",
    label: "Notifications",
    icon: "notifications-outline",
  },
] as const;

export default function AdminLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const colors = useTheme();
  const { user, isAdminMode, exitAdminMode } = useAuthState();
  // The web app can be framed inside a much wider browser window.
  const [contentWidth, setContentWidth] = useState(0);
  const desktop = contentWidth >= 768;

  useEffect(() => {
    if (user?.role !== "ADMIN" || !isAdminMode) {
      router.replace("/(tabs)");
    }
  }, [isAdminMode, router, user?.role]);

  if (user?.role !== "ADMIN" || !isAdminMode) {
    return null;
  }

  const exit = () => {
    exitAdminMode();
    router.replace("/(tabs)");
  };

  return (
    <ApContainer>
      <View
        className="border-b px-4 py-4"
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.surfaceBorder,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
            <ApText size="xl" font="bold" color={colors.textPrimary}>
              Embermate Admin
            </ApText>
            <ApText size="xs" color={colors.textMuted} className="mt-1">
              {user.name} · Administrator
            </ApText>
          </View>
          <Pressable
            onPress={exit}
            className="rounded-xl px-3 py-2"
            style={{ backgroundColor: colors.surfaceLight, flexShrink: 0 }}
            accessibilityRole="button"
            accessibilityLabel="Exit admin mode"
          >
            <ApText size="sm" font="bold" color={colors.primary}>
              Exit mode
            </ApText>
          </Pressable>
        </View>
      </View>
      <View
        onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
        style={{ flex: 1, minHeight: 0, flexDirection: desktop ? "row" : "column" }}
      >
        <ScrollView
          horizontal={!desktop}
          showsHorizontalScrollIndicator={false}
          className={
            desktop ? "border-r" : "border-b"
          }
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
            flexGrow: 0,
            flexShrink: 0,
            ...(desktop ? { width: 224 } : { width: "100%" }),
          }}
          contentContainerClassName={
            desktop ? "gap-y-2 p-3" : "gap-x-2 px-3 py-2"
          }
        >
          {menu.map((item) => {
            const active =
              pathname === item.path ||
              (item.path !== "/admin" && pathname.startsWith(`${item.path}/`));
            return (
              <Pressable
                key={item.path}
                onPress={() => router.push(item.path as never)}
                className={
                  desktop
                    ? "w-full flex-row items-center rounded-xl px-3 py-3"
                    : "flex-row items-center rounded-xl px-3 py-2"
                }
                style={{
                  flexShrink: 0,
                  backgroundColor: active
                    ? colors.primary
                    : colors.surfaceLight,
                }}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.label}`}
              >
                <Ionicons
                  name={item.icon as never}
                  size={16}
                  color={active ? colors.background : colors.textMuted}
                />
                <ApText
                  size="sm"
                  font="bold"
                  color={active ? colors.background : colors.textPrimary}
                  className="ml-2"
                >
                  {item.label}
                </ApText>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          <Slot />
        </View>
      </View>
    </ApContainer>
  );
}
