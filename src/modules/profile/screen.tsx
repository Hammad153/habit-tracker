import React, { useEffect, useState } from "react";
import { View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "react-native-paper";
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
import StatCard from "./components/StatCard";
import SettingsItem from "./components/SettingsItem";

const ProfileScreen = () => {
  const { user, signOut } = useAuthState();
  const { profile, loading, fetchProfile } = useProfileState();
  const { themeMode, soundEnabled, hapticEnabled, colors } = useSettingsState();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    AuthService.logout()
      .then(() => signOut())
      .catch(() => signOut());
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
            <View
              className="absolute bottom-0 right-0 rounded-full p-1 border-2"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.background,
              }}
            >
              <Ionicons name="camera" size={12} color={colors.background} />
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
          <View className="bg-surface rounded-2xl overflow-hidden mb-6">
            <SettingsItem
              label="Notifications"
              icon="notifications"
              value="On"
            />
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
          <View className="bg-surface rounded-2xl overflow-hidden mb-6">
            <SettingsItem label="Subscription" icon="star" value="Pro" />
            <SettingsItem label="Change Password" icon="lock-closed" />
          </View>

          <SettingsItem
            label="Log Out"
            icon="log-out"
            isDestructive
            onPress={handleLogout}
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
          <Button
            mode="outlined"
            onPress={() => setShowLogoutModal(false)}
            textColor={colors.textMuted}
            style={{
              flex: 1,
              borderColor: colors.surfaceBorder,
              borderRadius: 16,
            }}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={confirmLogout}
            buttonColor={colors.danger}
            textColor={colors.white}
            labelStyle={{ fontWeight: "bold" }}
            style={{ flex: 1, borderRadius: 16 }}
          >
            Log Out
          </Button>
        </View>
      </ApModal>
    </ApContainer>
  );
};

export default ProfileScreen;
