import React, { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import {
  User,
  Star,
  Lock,
  Sliders,
  Flag,
  Layers,
  Calendar,
  BookOpen,
  BarChart2,
  Clock,
  Download,
  Palette,
  Volume2,
  Sparkles,
  Bell,
  Gift,
  LogOut,
  Trash2,
} from "lucide-react-native";
import { router } from "expo-router";
import {
  ApScrollView,
  ApContainer,
  ApText,
  ApModal,
  Skeleton,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useAuthState } from "@/src/modules/auth/context";
import { useProfileState } from "./context";
import { AuthService } from "@/src/modules/auth/api";
import { ToastService } from "@/src/services";
import SettingsItem from "./components/SettingsItem";

interface ProfileMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  route?: string;
  value?: string;
  onPress?: () => void;
  isDestructive?: boolean;
}

interface ProfileSection {
  title: string;
  items: ProfileMenuItem[];
}

const ProfileScreen = () => {
  const { user, signOut } = useAuthState();
  const { profile, loading, fetchProfile } = useProfileState();
  const { themeMode, soundEnabled, hapticEnabled, colors } = useSettingsState();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    signOut();
  };

  const confirmDeleteAccount = async () => {
    setDeleting(true);
    try {
      await AuthService.deleteAccount();
      setShowDeleteModal(false);
      ToastService.Success("Your account has been deleted");
      await signOut();
    } catch (err: any) {
      ToastService.ApiError(err);
    } finally {
      setDeleting(false);
    }
  };

  const isInitialLoading = loading || !profile?.id;

  const appearanceValue =
    themeMode === "system" ? "System" : themeMode === "dark" ? "Dark" : "Light";
  const soundsValue = soundEnabled || hapticEnabled ? "On" : "Off";
  const displayName = user?.name || profile?.name || "User";
  const displayEmail = user?.email || profile?.email || "";
  const displaySubtitle =
    displayEmail || `${profile?.currentStreak ?? 0} day streak · Level ${profile?.level ?? 1}`;

  const SECTIONS: ProfileSection[] = [
    {
      title: "Account",
      items: [
        {
          id: "subscription",
          label: "Subscription",
          icon: Star,
          route: "/subscription",
          value: "Manage",
        },
        {
          id: "change-password",
          label: "Change password",
          icon: Lock,
          route: "/settings/change-password",
        },
      ],
    },
    {
      title: "Goals & Tracking",
      items: [
        {
          id: "manage-habits",
          label: "Manage habits",
          icon: Sliders,
          route: "/manage-habits",
        },
        {
          id: "identities",
          label: "Identity goals",
          icon: Flag,
          route: "/identities",
        },
        {
          id: "templates",
          label: "Habit templates",
          icon: Layers,
          route: "/templates",
        },
        {
          id: "planner-calendar",
          label: "Planner calendar",
          icon: Calendar,
          route: "/planner-calendar",
        },
        {
          id: "journal",
          label: "Journal & reflections",
          icon: BookOpen,
          route: "/journal",
        },
      ],
    },
    {
      title: "Insights & Data",
      items: [
        {
          id: "analytics",
          label: "Advanced analytics",
          icon: BarChart2,
          route: "/analytics",
        },
        {
          id: "timeline",
          label: "Habit timeline",
          icon: Clock,
          route: "/timeline",
        },
        {
          id: "export",
          label: "Export data",
          icon: Download,
          route: "/export",
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          id: "appearance",
          label: "Appearance & theme",
          icon: Palette,
          route: "/settings/appearance",
          value: appearanceValue,
        },
        {
          id: "sounds",
          label: "Sounds & haptics",
          icon: Volume2,
          route: "/settings/sounds",
          value: soundsValue,
        },
        {
          id: "coach",
          label: "AI Coach preferences",
          icon: Sparkles,
          route: "/settings/coach",
        },
        {
          id: "notifications",
          label: "Notifications feed",
          icon: Bell,
          route: "/notifications",
        },
        {
          id: "reward-shop",
          label: "Reward shop",
          icon: Gift,
          route: "/reward-shop",
        },
      ],
    },
    {
      title: "Session",
      items: [
        {
          id: "logout",
          label: "Log out",
          icon: LogOut,
          isDestructive: true,
          onPress: handleLogout,
        },
        {
          id: "delete-account",
          label: "Delete account",
          icon: Trash2,
          isDestructive: true,
          onPress: () => setShowDeleteModal(true),
        },
      ],
    },
  ];

  return (
    <ApContainer>
      <ApScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
      >
        {/* Screen Title (matching reference design) */}
        <View className="pt-3 pb-4">
          <ApText size="3xl" font="bold" color={colors.textPrimary}>
            Profile
          </ApText>
        </View>

        {/* User Card */}
        {isInitialLoading ? (
          <View
            className="rounded-2xl p-4 flex-row items-center border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <Skeleton width={48} height={48} radius={24} />
            <View className="ml-3.5 flex-1">
              <Skeleton width="45%" height={18} radius={4} className="mb-2" />
              <Skeleton width="60%" height={12} radius={4} />
            </View>
          </View>
        ) : (
          <View
            className="rounded-2xl p-4 flex-row items-center border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-3.5 border"
              style={{
                backgroundColor: colors.surface2 || colors.background,
                borderColor: colors.surfaceBorder,
              }}
            >
              <User size={22} color={colors.textPrimary} strokeWidth={1.8} />
            </View>
            <View className="flex-1 min-w-0">
              <ApText size="base" font="bold" color={colors.textPrimary} numberOfLines={1}>
                {displayName}
              </ApText>
              <ApText size="xs" color={colors.textMuted} numberOfLines={1} className="mt-0.5">
                {displaySubtitle}
              </ApText>
            </View>
          </View>
        )}

        {/* Categorized List Sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} className="mt-6">
            <ApText
              size="sm"
              font="medium"
              color={colors.textSecondary}
              className="mb-2.5 px-1"
            >
              {section.title}
            </ApText>
            <View
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              }}
            >
              {section.items.map((item, index) => (
                <SettingsItem
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  value={item.value}
                  isDestructive={item.isDestructive}
                  showBorderBottom={index < section.items.length - 1}
                  onPress={() => {
                    if (item.onPress) {
                      item.onPress();
                    } else if (item.route) {
                      router.push(item.route as any);
                    }
                  }}
                />
              ))}
            </View>
          </View>
        ))}
      </ApScrollView>

      {/* Logout Modal */}
      <ApModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Log Out"
        subTitle="Are you sure you want to log out?"
      >
        <View className="flex-row gap-x-2 mt-3">
          <TouchableOpacity
            onPress={() => setShowLogoutModal(false)}
            className="flex-1 py-3 rounded-xl border items-center"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <ApText font="medium" color={colors.textMuted}>
              Cancel
            </ApText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmLogout}
            className="flex-1 py-3 rounded-xl items-center"
            style={{ backgroundColor: colors.danger }}
          >
            <ApText font="semibold" color={colors.inkInverse}>
              Log Out
            </ApText>
          </TouchableOpacity>
        </View>
      </ApModal>

      {/* Delete Account Modal */}
      <ApModal
        visible={showDeleteModal}
        onClose={() => !deleting && setShowDeleteModal(false)}
        title="Delete Account"
        subTitle="This permanently deletes your account and all habits, completions, and progress. This cannot be undone."
      >
        <View className="flex-row gap-x-2 mt-3">
          <TouchableOpacity
            onPress={() => setShowDeleteModal(false)}
            disabled={deleting}
            className="flex-1 py-3 rounded-xl border items-center"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <ApText font="medium" color={colors.textMuted}>
              Cancel
            </ApText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmDeleteAccount}
            disabled={deleting}
            className="flex-1 py-3 rounded-xl items-center"
            style={{
              backgroundColor: colors.danger,
              opacity: deleting ? 0.6 : 1,
            }}
          >
            <ApText font="semibold" color={colors.inkInverse}>
              {deleting ? "Deleting..." : "Delete"}
            </ApText>
          </TouchableOpacity>
        </View>
      </ApModal>
    </ApContainer>
  );
};

export default ProfileScreen;
