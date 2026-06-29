import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import {
  ApLoader,
  ApScrollView,
  ApContainer,
  ApHeader,
  ApText,
  ApModal,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useAuthState } from "@/src/modules/auth/context";
import { useProfileState } from "./context";
import { AuthService } from "@/src/modules/auth/api";
import { ToastService } from "@/src/services";
import StatCard from "./components/StatCard";
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
    // signOut() invalidates the server-side refresh token before clearing
    // local session (see auth context), so no separate logout call is needed.
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

  if (loading) {
    return <ApLoader />;
  }

  const appearanceValue =
    themeMode === "system" ? "System" : themeMode === "dark" ? "Dark" : "Light";
  const soundsValue = soundEnabled || hapticEnabled ? "On" : "Off";

  return (
    <ApContainer>
      <ApHeader title="Profile" />
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center mt-6 mb-8">
          <View className="relative">
            <View
              className="w-24 h-24 rounded-full items-center justify-center overflow-hidden border-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.primary,
              }}
            >
              {user?.avatar || profile?.avatar ? (
                <Image
                  source={{ uri: user?.avatar || profile?.avatar }}
                  className="w-full h-full"
                />
              ) : (
                <ApText size="3xl" font="bold" color={colors.primary}>
                  {(user?.name || profile?.name)
                    ?.substring(0, 2)
                    .toUpperCase() || "HI"}
                </ApText>
              )}
            </View>
          </View>

          <ApText
            size="xl"
            font="bold"
            color={colors.textPrimary}
            className="mt-4"
          >
            {user?.name || profile?.name || "User"}
          </ApText>
          <ApText size="sm" color={colors.textMuted}>
            {user?.email || profile?.email || ""}
          </ApText>
        </View>

        <View className="px-5 mb-8">
          <View className="flex-row">
            <StatCard
              label="Total Habits"
              value={profile?.totalHabits?.toString() || "0"}
            />
            <StatCard
              label="Longest Streak"
              value={profile?.longestStreak?.toString() || "0"}
            />
            <StatCard
              label="Completion"
              value={`${Math.round((profile?.completionRate || 0) * 100)}%`}
            />
          </View>
        </View>

        <View className="px-5 mb-20 space-y-2">
          <ApText
            size="sm"
            font="bold"
            color={colors.textMuted}
            className="mb-2 uppercase"
            style={{ letterSpacing: 1 }}
          >
            General
          </ApText>
          <View className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: colors.surface }}>
            <SettingsItem
              label="Sounds & Haptics"
              icon="musical-note"
              value={soundsValue}
              onPress={() => router.push("/settings/sounds")}
            />
            <SettingsItem
              label="Appearance"
              icon="color-palette"
              value={appearanceValue}
              onPress={() => router.push("/settings/appearance")}
            />
          </View>

          <ApText
            size="sm"
            font="bold"
            color={colors.textMuted}
            className="mb-2 uppercase"
            style={{ letterSpacing: 1 }}
          >
            Account
          </ApText>
          <View className="rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: colors.surface }}>
            <SettingsItem
              label="Subscription"
              icon="star"
              value="Manage"
              onPress={() => router.push("/subscription")}
            />
            <SettingsItem
              label="Export Data"
              icon="download"
              onPress={() => router.push("/export" as any)}
            />
            <SettingsItem
              label="Advanced Analytics"
              icon="analytics"
              onPress={() => router.push("/analytics" as any)}
            />
            <SettingsItem
              label="Change Password"
              icon="lock-closed"
              onPress={() => router.push("/settings/change-password" as any)}
            />
          </View>

          <SettingsItem
            label="Log Out"
            icon="log-out"
            isDestructive
            onPress={handleLogout}
          />

          <SettingsItem
            label="Delete Account"
            icon="trash"
            isDestructive
            onPress={() => setShowDeleteModal(true)}
          />
        </View>
      </ApScrollView>

      <ApModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Log Out"
        subTitle="Are you sure you want to log out?"
      >
        <View className="flex-row gap-x-2 mt-2">
          <TouchableOpacity
            onPress={() => setShowLogoutModal(false)}
            className="flex-1 py-4 rounded-2xl border items-center"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <ApText font="semibold" color={colors.textMuted}>
              Cancel
            </ApText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmLogout}
            className="flex-1 py-4 rounded-2xl items-center"
            style={{ backgroundColor: colors.danger }}
          >
            <ApText font="bold" color={colors.white}>
              Log Out
            </ApText>
          </TouchableOpacity>
        </View>
      </ApModal>

      <ApModal
        visible={showDeleteModal}
        onClose={() => !deleting && setShowDeleteModal(false)}
        title="Delete Account"
        subTitle="This permanently deletes your account and all habits, completions and progress. This cannot be undone."
      >
        <View className="flex-row gap-x-2 mt-2">
          <TouchableOpacity
            onPress={() => setShowDeleteModal(false)}
            disabled={deleting}
            className="flex-1 py-4 rounded-2xl border items-center"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <ApText font="semibold" color={colors.textMuted}>
              Cancel
            </ApText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmDeleteAccount}
            disabled={deleting}
            className="flex-1 py-4 rounded-2xl items-center"
            style={{ backgroundColor: colors.danger, opacity: deleting ? 0.6 : 1 }}
          >
            <ApText font="bold" color={colors.white}>
              {deleting ? "Deleting..." : "Delete"}
            </ApText>
          </TouchableOpacity>
        </View>
      </ApModal>
    </ApContainer>
  );
};

export default ProfileScreen;
