import React, { useEffect } from "react";
import { View, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApText, ApContainer, ApScrollView } from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useAuthState } from "@/src/modules/auth/context";
import { useProfileState } from "@/src/modules/profile/context";

interface MoreMenuItem {
  label: string;
  icon: string;
  route: string;
  description: string;
  badge?: string;
  color?: string;
}

const MENU_SECTIONS: { title: string; items: MoreMenuItem[] }[] = [
  {
    title: "Personal",
    items: [
      {
        label: "Profile",
        icon: "person-circle",
        route: "/profile",
        description: "Account info, stats & settings",
      },
      {
        label: "Journal",
        icon: "journal",
        route: "/journal",
        description: "Reflect on your day",
      },
      {
        label: "Daily Plan",
        icon: "calendar",
        route: "/(tabs)/daily-plan",
        description: "Plan tasks, priorities & reflection",
      },
      {
        label: "Budget",
        icon: "wallet",
        route: "/(tabs)/budget",
        description: "Track spending and income",
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        label: "Advanced Analytics",
        icon: "bar-chart",
        route: "/analytics",
        description: "Deep dive into your habit data",
      },
      {
        label: "Progress",
        icon: "stats-chart",
        route: "/(tabs)/progress",
        description: "Visualize consistency trends",
      },
      {
        label: "Timeline",
        icon: "time",
        route: "/timeline",
        description: "View your habit history",
      },
      {
        label: "Awards",
        icon: "trophy",
        route: "/(tabs)/awards",
        description: "Your achievements & badges",
        color: "#F59E0B",
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        label: "Habit Templates",
        icon: "grid",
        route: "/templates",
        description: "Browse pre-built habits",
      },
      {
        label: "Export Data",
        icon: "download",
        route: "/export",
        description: "Download your habit records",
      },
      {
        label: "Notifications",
        icon: "notifications",
        route: "/notifications",
        description: "View your activity feed",
      },
    ],
  },
];

const MoreScreen = () => {
  const { colors } = useSettingsState();
  const { user } = useAuthState();
  const { profile, fetchProfile } = useProfileState();

  useEffect(() => {
    fetchProfile();
  }, []);

  const navigateTo = (route: string) => {
    router.push(route as any);
  };

  return (
    <ApContainer>
      <ApScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-6 pb-4">
          <ApText size="2xl" font="bold" color={colors.textPrimary}>
            More
          </ApText>
          <ApText size="sm" color={colors.textMuted} className="mt-1">
            Access all features & settings
          </ApText>
        </View>

        {/* User Banner */}
        <TouchableOpacity
          onPress={() => navigateTo("/profile")}
          activeOpacity={0.85}
          className="mx-5 mb-6 p-4 rounded-3xl flex-row items-center"
          style={{ backgroundColor: colors.primary + "12", borderWidth: 1, borderColor: colors.primary + "20" }}
        >
          <View
            className="w-16 h-16 rounded-full items-center justify-center overflow-hidden border-2"
            style={{ backgroundColor: colors.surface, borderColor: colors.primary }}
          >
            {user?.avatar || profile?.avatar ? (
              <Image
                source={{ uri: user?.avatar || profile?.avatar }}
                className="w-full h-full"
              />
            ) : (
              <ApText size="xl" font="bold" color={colors.primary}>
                {(user?.name || profile?.name)?.substring(0, 2).toUpperCase() || "HI"}
              </ApText>
            )}
          </View>

          <View className="ml-4 flex-1">
            <ApText size="base" font="bold" color={colors.textPrimary} numberOfLines={1}>
              {user?.name || profile?.name || "User"}
            </ApText>
            <ApText size="xs" color={colors.textMuted} numberOfLines={1}>
              {user?.email || profile?.email || ""}
            </ApText>
            <View className="flex-row mt-2 space-x-3">
              <View className="flex-row items-center">
                <Ionicons name="flame" size={13} color={colors.primary} />
                <ApText size="xs" color={colors.textSecondary} className="ml-1">
                  {profile?.currentStreak ?? 0} streak
                </ApText>
              </View>
              <View className="flex-row items-center ml-3">
                <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                <ApText size="xs" color={colors.textSecondary} className="ml-1">
                  {profile?.totalHabits ?? 0} habits
                </ApText>
              </View>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} className="px-5 mb-6">
            <ApText
              size="xs"
              font="bold"
              color={colors.textMuted}
              className="mb-3 uppercase"
              style={{ letterSpacing: 1 }}
            >
              {section.title}
            </ApText>

            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder }}
            >
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.route}
                  onPress={() => navigateTo(item.route)}
                  activeOpacity={0.7}
                  className="flex-row items-center px-4 py-4"
                  style={{
                    borderBottomWidth: index < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: colors.surfaceBorder,
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: (item.color || colors.primary) + "18" }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.color || colors.primary}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <ApText size="sm" font="semibold" color={colors.textPrimary}>
                      {item.label}
                    </ApText>
                    <ApText size="xs" color={colors.textMuted} className="mt-0.5">
                      {item.description}
                    </ApText>
                  </View>
                  {item.badge && (
                    <View
                      className="px-2 py-0.5 rounded-full mr-2"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <ApText size="xs" font="bold" color={colors.primary}>
                        {item.badge}
                      </ApText>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View className="h-10" />
      </ApScrollView>
    </ApContainer>
  );
};

export default MoreScreen;
