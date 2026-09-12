import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import {
  Flag,
  BookOpen,
  Calendar,
  Gift,
  BarChart2,
  Clock,
  Download,
  Grid,
  Palette,
  Bell,
  ChevronRight,
} from "lucide-react-native";
import { router } from "expo-router";
import { ApText, ApContainer, ApScrollView, Avatar, ApCard, ApHeader } from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useAuthState } from "@/src/modules/auth/context";
import { useProfileState } from "@/src/modules/profile/context";

interface MoreMenuItem {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  route: string;
  description: string;
}

const MENU_SECTIONS: { title: string; items: MoreMenuItem[] }[] = [
  {
    title: "Personal & Habits",
    items: [
      {
        label: "Identity",
        icon: Flag,
        route: "/identities",
        description: "Define who you want to become",
      },
      {
        label: "Journal",
        icon: BookOpen,
        route: "/journal",
        description: "Reflect on your day",
      },
      {
        label: "Planner Calendar",
        icon: Calendar,
        route: "/planner-calendar",
        description: "Browse plans by date",
      },
      {
        label: "Reward Shop",
        icon: Gift,
        route: "/reward-shop",
        description: "Spend coins on themes & extras",
      },
    ],
  },
  {
    title: "Insights & Data",
    items: [
      {
        label: "Advanced Analytics",
        icon: BarChart2,
        route: "/analytics",
        description: "Deep dive into your habit data",
      },
      {
        label: "Timeline",
        icon: Clock,
        route: "/timeline",
        description: "View your habit history",
      },
      {
        label: "Export Data",
        icon: Download,
        route: "/export",
        description: "Download your habit records",
      },
    ],
  },
  {
    title: "Tools & Customization",
    items: [
      {
        label: "Habit Templates",
        icon: Grid,
        route: "/templates",
        description: "Browse pre-built habits",
      },
      {
        label: "Appearance & Sounds",
        icon: Palette,
        route: "/settings/appearance",
        description: "Customize theme & audio feedback",
      },
      {
        label: "Notifications Feed",
        icon: Bell,
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

  const displayName = user?.name || profile?.name || "User";
  const displayEmail = user?.email || profile?.email || "";

  return (
    <ApContainer>
      <ApHeader title="More" subheader="Access all features & settings" />
      <ApScrollView showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <TouchableOpacity
          onPress={() => navigateTo("/profile")}
          activeOpacity={0.8}
          className="mb-6 mt-2"
        >
          <ApCard className="p-4 flex-row items-center">
            <Avatar name={displayName} size="lg" />
            <View className="ml-3.5 flex-1 min-w-0">
              <ApText size="base" font="semibold" color={colors.textPrimary} numberOfLines={1}>
                {displayName}
              </ApText>
              <ApText size="xs" color={colors.textMuted} numberOfLines={1}>
                {displayEmail}
              </ApText>
              <View className="flex-row items-center mt-1 gap-3">
                <ApText size="xs" color={colors.textSecondary}>
                  {profile?.currentStreak ?? 0} streak
                </ApText>
                <ApText size="xs" color={colors.textMuted}>·</ApText>
                <ApText size="xs" color={colors.textSecondary}>
                  {profile?.totalHabits ?? 0} habits
                </ApText>
                <ApText size="xs" color={colors.textMuted}>·</ApText>
                <ApText size="xs" color={colors.textSecondary}>
                  {profile?.coins ?? 0} coins
                </ApText>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </ApCard>
        </TouchableOpacity>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} className="mb-5">
            <ApText
              size="xs"
              font="semibold"
              color={colors.textMuted}
              className="mb-2 uppercase"
              style={{ letterSpacing: 0.8 }}
            >
              {section.title}
            </ApText>

            <ApCard className="overflow-hidden">
              {section.items.map((item, index) => {
                const IconComp = item.icon;
                return (
                  <TouchableOpacity
                    key={item.route}
                    onPress={() => navigateTo(item.route)}
                    activeOpacity={0.7}
                    className="flex-row items-center px-4 py-3.5"
                    style={{
                      borderTopWidth: index > 0 ? 1 : 0,
                      borderTopColor: colors.surfaceBorder,
                    }}
                  >
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: colors.accentLight }}
                    >
                      <IconComp size={18} color={colors.primary} />
                    </View>
                    <View className="flex-1 mr-2 min-w-0">
                      <ApText size="sm" font="medium" color={colors.textPrimary}>
                        {item.label}
                      </ApText>
                      <ApText size="xs" color={colors.textMuted} numberOfLines={1} className="mt-0.5">
                        {item.description}
                      </ApText>
                    </View>
                    <ChevronRight size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </ApCard>
          </View>
        ))}
      </ApScrollView>
    </ApContainer>
  );
};

export default MoreScreen;
