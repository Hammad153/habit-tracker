import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ApScrollView } from "@/src/components/ScrollView";
import ApContainer from "@/src/components/containers/container";
import { ApHeader } from "@/src/components/Header";
import { ApText } from "@/src/components/Text";
import { Ionicons } from "@expo/vector-icons";
import StatCard from "../../modules/profiles/components/StatCard";
import SettingsItem from "../../modules/profiles/components/SettingsItem";
import { useAuth } from "@/src/components/AuthContext";
import { authService } from "@/src/services/auth.service";
import { useProfile } from "@/hooks/useProfile";
import ChangePasswordModal from "../../modules/profiles/components/ChangePasswordModal";
import { useSettings } from "@/src/context/SettingsContext";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const [isChangePasswordVisible, setIsChangePasswordVisible] =
    React.useState(false);
  const { themeMode, soundEnabled, hapticEnabled, colors } = useSettings();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await authService.logout();
            await signOut();
          } catch (e) {
            await signOut();
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <ApContainer>
        <View className="flex-1 justify-center items-center bg-background">
          <ActivityIndicator color={colors.primary} />
        </View>
      </ApContainer>
    );
  }

  const appearanceValue =
    themeMode === "system" ? "System" : themeMode === "dark" ? "Dark" : "Light";
  const soundsValue = soundEnabled || hapticEnabled ? "On" : "Off";

  return (
    <ApContainer>
      <View className="h-screen bg-background">
        <ApHeader
          title="Profile"
          hasBackButton
          onBack={() => router.back()}
          right={
            <TouchableOpacity>
              <Ionicons name="settings" size={24} color={colors.primary} />
            </TouchableOpacity>
          }
        />
        <ApScrollView showsVerticalScrollIndicator={false}>
          <View className="items-center mt-6 mb-8">
            <View className="relative">
              <View
                className="w-24 h-24 rounded-full items-center justify-center overflow-hidden border-2"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                }}>
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
                }}>
                <Ionicons name="camera" size={12} color={colors.background} />
              </View>
            </View>

            <ApText
              size="xl"
              font="bold"
              color={colors.textPrimary}
              className="mt-4">
              {user?.name || profile?.name || "User"}
            </ApText>
            <ApText size="sm" color={colors.textMuted}>
              {user?.email || profile?.email || ""}
            </ApText>

            <TouchableOpacity className="mt-3 px-4 py-1.5 rounded-full border border-surface">
              <ApText size="xs" color={colors.primary} font="bold">
                Edit Profile
              </ApText>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <View className="px-3 mb-8">
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

          {/* Settings Section */}
          <View className="px-3 mb-20 space-y-2">
            <ApText
              size="sm"
              font="bold"
              color={colors.textMuted}
              className="mb-2 uppercase"
              style={{ letterSpacing: 1 }}>
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
              style={{ letterSpacing: 1 }}>
              Account
            </ApText>
            <View className="bg-surface rounded-2xl overflow-hidden mb-6">
              <SettingsItem label="Subscription" icon="star" value="Pro" />
              <SettingsItem
                label="Change Password"
                icon="lock-closed"
                onPress={() => setIsChangePasswordVisible(true)}
              />
            </View>

            <SettingsItem
              label="Log Out"
              icon="log-out"
              isDestructive
              onPress={handleLogout}
            />
          </View>
        </ApScrollView>

        <ChangePasswordModal
          isVisible={isChangePasswordVisible}
          onClose={() => setIsChangePasswordVisible(false)}
        />
      </View>
    </ApContainer>
  );
}
