import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import {
  ApContainer,
  ApHeader,
  ApLoader,
  ApScrollView,
  ApText,
} from "@/src/components";
import { useAuthState } from "@/src/modules/auth/context";
import { AdminService } from "@/src/modules/admin/api";
import { useTheme } from "@/src/modules/settings/context";
import { ToastService } from "@/src/services";

const adminMenus = [
  {
    key: "overview",
    label: "Overview",
    description: "System health and platform metrics",
    icon: "📊",
  },
  {
    key: "users",
    label: "Users",
    description: "Browse users and manage account status",
    icon: "👥",
  },
  {
    key: "habits",
    label: "Habits",
    description: "Inspect habits and behavior data",
    icon: "✓",
  },
  {
    key: "shop",
    label: "Shop & Economy",
    description: "Manage items, redemptions, and economy stats",
    icon: "◈",
  },
  {
    key: "analytics",
    label: "Behavior Analytics",
    description: "Review effectiveness and dashboard insights",
    icon: "⌁",
  },
  {
    key: "audit",
    label: "Audit Logs",
    description: "Review administrative activity",
    icon: "▤",
  },
  {
    key: "system",
    label: "System",
    description: "Inspect current system configuration",
    icon: "⚙",
  },
] as const;

const AdminScreen = () => {
  const { user, isAdminMode, exitAdminMode } = useAuthState();
  const colors = useTheme();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [selectedMenu, setSelectedMenu] = useState("overview");
  const [menuData, setMenuData] = useState<any>(null);
  const [loadingMenu, setLoadingMenu] = useState(false);

  useEffect(() => {
    if (user?.role !== "ADMIN" || !isAdminMode) {
      router.replace("/(tabs)");
      return;
    }

    AdminService.getOverview()
      .then((data) => {
        setOverview(data);
        setMenuData(data);
      })
      .catch((error) => ToastService.ApiError(error))
      .finally(() => setLoading(false));
  }, [isAdminMode, user?.role]);

  const exit = () => {
    exitAdminMode();
    router.replace("/(tabs)");
  };

  const openMenu = async (key: (typeof adminMenus)[number]["key"]) => {
    setSelectedMenu(key);
    if (key === "overview") {
      setMenuData(overview);
      return;
    }

    setLoadingMenu(true);
    try {
      const data = await (
        {
          users: AdminService.getUsers,
          habits: AdminService.getHabits,
          shop: AdminService.getShopItems,
          analytics: AdminService.getDashboard,
          audit: AdminService.getAuditLogs,
          system: AdminService.getSystemConfig,
        } as const
      )[key]();
      setMenuData(data);
    } catch (error) {
      ToastService.ApiError(error);
    } finally {
      setLoadingMenu(false);
    }
  };

  if (loading) return <ApLoader />;

  return (
    <ApContainer>
      <ApHeader
        title="Admin Mode"
        subheader={`${user?.name ?? "Administrator"} · ADMIN`}
        right={
          <Pressable
            onPress={exit}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Exit admin mode"
          >
            <ApText size="sm" font="bold" color={colors.primary}>
              Exit
            </ApText>
          </Pressable>
        }
      />
      <ApScrollView contentContainerClassName="pb-12">
        <View
          className="mt-4 mb-6 rounded-3xl p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.primary,
            borderWidth: 1,
          }}
        >
          <ApText size="lg" font="bold" color={colors.textPrimary}>
            Administrator workspace
          </ApText>
          <ApText size="sm" color={colors.textMuted} className="mt-2">
            You are viewing privileged tools. Exit admin mode any time to return
            to the regular app.
          </ApText>
          {overview && (
            <ApText
              size="sm"
              font="bold"
              color={colors.primary}
              className="mt-4"
            >
              {typeof overview === "object"
                ? `${Object.keys(overview).length} overview metrics available`
                : "Overview loaded"}
            </ApText>
          )}
        </View>

        <ApText
          size="xs"
          font="bold"
          color={colors.textMuted}
          className="mb-2 uppercase tracking-wider"
        >
          Admin menus
        </ApText>
        {adminMenus.map((menu) => (
          <Pressable
            key={menu.key}
            onPress={() => void openMenu(menu.key)}
            className="mb-3 flex-row items-center rounded-3xl border p-4"
            style={{
              backgroundColor: colors.surface,
              borderColor:
                selectedMenu === menu.key
                  ? colors.primary
                  : colors.surfaceBorder,
            }}
            accessibilityRole="button"
            accessibilityLabel={`Open ${menu.label}`}
          >
            <View
              className="mr-4 h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.surfaceLight }}
            >
              <ApText size="xl" font="bold" color={colors.primary}>
                {menu.icon}
              </ApText>
            </View>
            <View className="flex-1">
              <ApText size="base" font="bold" color={colors.textPrimary}>
                {menu.label}
              </ApText>
              <ApText size="sm" color={colors.textMuted} className="mt-1">
                {menu.description}
              </ApText>
            </View>
            <ApText size="lg" color={colors.textMuted}>
              ›
            </ApText>
          </Pressable>
        ))}

        <View
          className="mt-3 rounded-3xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
          }}
        >
          <ApText size="sm" font="bold" color={colors.textPrimary}>
            {adminMenus.find((menu) => menu.key === selectedMenu)?.label ??
              "Admin data"}
          </ApText>
          {loadingMenu ? (
            <ApText size="sm" color={colors.textMuted} className="mt-3">
              Loading admin data...
            </ApText>
          ) : (
            <ApText size="xs" color={colors.textMuted} className="mt-3">
              {JSON.stringify(menuData, null, 2)}
            </ApText>
          )}
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default AdminScreen;
