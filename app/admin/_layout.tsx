import React, { useEffect } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";
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
] as const;

export default function AdminLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const colors = useTheme();
  const { user, isAdminMode, exitAdminMode } = useAuthState();
  const { width } = useWindowDimensions();
  const desktop = width >= 768;

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
          <View>
            <ApText size="xl" font="bold" color={colors.textPrimary}>
              Routina Admin
            </ApText>
            <ApText size="xs" color={colors.textMuted} className="mt-1">
              {user.name} · Administrator
            </ApText>
          </View>
          <Pressable
            onPress={exit}
            className="rounded-xl px-3 py-2"
            style={{ backgroundColor: colors.surfaceLight }}
            accessibilityRole="button"
            accessibilityLabel="Exit admin mode"
          >
            <ApText size="sm" font="bold" color={colors.primary}>
              Exit mode
            </ApText>
          </Pressable>
        </View>
      </View>
      <View className="flex-1 flex-row">
        <ScrollView
          horizontal={!desktop}
          showsHorizontalScrollIndicator={false}
          className={
            desktop ? "w-56 border-r" : "absolute z-10 w-full border-b"
          }
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
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
        <View className={desktop ? "flex-1" : "mt-14 flex-1"}>
          <Slot />
        </View>
      </View>
    </ApContainer>
  );
}
