import React, { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import {
  Palette,
  Volume2,
  Sparkles,
  Star,
  Lock,
  LogOut,
  Trash2,
} from "lucide-react-native";
import { router } from "expo-router";
import {
  ApScrollView,
  ApContainer,
  ApHeader,
  ApText,
  ApModal,
  Avatar,
  ApCard,
  Skeleton,
  SkeletonStatRow,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useAuthState } from "@/src/modules/auth/context";
import { useProfileState } from "./context";
import { AuthService } from "@/src/modules/auth/api";
import { ToastService } from "@/src/services";
import SettingsItem from "./components/SettingsItem";

const ProfileScreen = () => {
  const { user, signOut } = useAuthState();
  const { profile, loading, fetchProfile } = useProfileState();
  const { themeMode, soundEnabled, hapticEnabled, colors } = useSettingsState();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const isInitialLoading = loading && !profile;

  const appearanceValue =
    themeMode === "system" ? "System" : themeMode === "dark" ? "Dark" : "Light";
  const soundsValue = soundEnabled || hapticEnabled ? "On" : "Off";
  const displayName = user?.name || profile?.name || "User";
  const displayEmail = user?.email || profile?.email || "";

  return (
    <ApContainer>
      <ApHeader title="Profile" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        {/* User plain row (Section 4.8) */}
        {isInitialLoading ? (
          <View className="flex-row items-center mt-2 mb-6">
            <Skeleton width={64} height={64} radius={32} />
            <View className="ml-4 flex-1">
              <Skeleton width="45%" height={20} radius={4} className="mb-2" />
              <Skeleton width="65%" height={12} radius={4} />
            </View>
          </View>
        ) : (
          <View className="flex-row items-center mt-2 mb-6">
            <Avatar name={displayName} size="xl" />
            <View className="ml-4 flex-1 min-w-0">
              <ApText size="lg" font="semibold" color={colors.textPrimary} numberOfLines={1}>
                {displayName}
              </ApText>
              {displayEmail ? (
                <ApText size="xs" color={colors.textMuted} className="mt-0.5" numberOfLines={1}>
                  {displayEmail}
                </ApText>
              ) : null}
            </View>
          </View>
        )}

        {/* 3 Plain stat pairs side by side */}
        {isInitialLoading ? (
          <SkeletonStatRow className="mb-6" />
        ) : (
          <View className="flex-row items-center justify-around py-4 mb-6">
            <View className="items-center flex-1">
              <ApText
                size="3xl"
                font="semibold"
                color={colors.textPrimary}
                style={{ letterSpacing: -0.5 }}
              >
                {profile?.currentStreak ?? 0}
              </ApText>
              <ApText
                size="xs"
                font="medium"
                color={colors.textMuted}
                className="uppercase mt-1"
                style={{ letterSpacing: 0.8 }}
              >
                Current Streak
              </ApText>
            </View>

            <View
              className="w-[1px] h-8 self-center"
              style={{ backgroundColor: colors.surfaceBorder }}
            />

            <View className="items-center flex-1">
              <ApText
                size="3xl"
                font="semibold"
                color={colors.textPrimary}
                style={{ letterSpacing: -0.5 }}
              >
                {profile?.longestStreak ?? 0}
              </ApText>
              <ApText
                size="xs"
                font="medium"
                color={colors.textMuted}
                className="uppercase mt-1"
                style={{ letterSpacing: 0.8 }}
              >
                Best Streak
              </ApText>
            </View>

            <View
              className="w-[1px] h-8 self-center"
              style={{ backgroundColor: colors.surfaceBorder }}
            />

            <View className="items-center flex-1">
              <ApText
                size="3xl"
                font="semibold"
                color={colors.textPrimary}
                style={{ letterSpacing: -0.5 }}
              >
                {profile?.totalHabits ?? 0}
              </ApText>
              <ApText
                size="xs"
                font="medium"
                color={colors.textMuted}
                className="uppercase mt-1"
                style={{ letterSpacing: 0.8 }}
              >
                Habits
              </ApText>
            </View>
          </View>
        )}

        {/* Sections */}
        <View className="mb-6">
          <ApText
            size="xs"
            font="semibold"
            color={colors.textMuted}
            className="uppercase mb-2"
            style={{ letterSpacing: 0.8, marginTop: 12 }}
          >
            Preferences
          </ApText>
          <ApCard className="overflow-hidden mb-5">
            <SettingsItem
              label="Appearance"
              icon={Palette}
              value={appearanceValue}
              onPress={() => router.push("/settings/appearance")}
            />
            <SettingsItem
              label="Sounds & Haptics"
              icon={Volume2}
              value={soundsValue}
              onPress={() => router.push("/settings/sounds")}
            />
            <SettingsItem
              label="AI Coach"
              icon={Sparkles}
              onPress={() => router.push("/settings/coach")}
            />
          </ApCard>

          <ApText
            size="xs"
            font="semibold"
            color={colors.textMuted}
            className="uppercase mb-2"
            style={{ letterSpacing: 0.8, marginTop: 12 }}
          >
            Account & Security
          </ApText>
          <ApCard className="overflow-hidden mb-5">
            <SettingsItem
              label="Subscription"
              icon={Star}
              value="Manage"
              onPress={() => router.push("/subscription")}
            />
            <SettingsItem
              label="Change Password"
              icon={Lock}
              onPress={() => router.push("/settings/change-password" as any)}
            />
          </ApCard>

          <ApCard className="overflow-hidden mb-5">
            <SettingsItem
              label="Log Out"
              icon={LogOut}
              isDestructive
              onPress={handleLogout}
            />
            <SettingsItem
              label="Delete Account"
              icon={Trash2}
              isDestructive
              onPress={() => setShowDeleteModal(true)}
            />
          </ApCard>
        </View>
      </ApScrollView>

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
            <ApText font="semibold" color={colors.background}>
              Log Out
            </ApText>
          </TouchableOpacity>
        </View>
      </ApModal>

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
            <ApText font="semibold" color={colors.background}>
              {deleting ? "Deleting..." : "Delete"}
            </ApText>
          </TouchableOpacity>
        </View>
      </ApModal>
    </ApContainer>
  );
};

export default ProfileScreen;
