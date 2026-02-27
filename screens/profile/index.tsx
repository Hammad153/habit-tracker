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
import { ApTheme } from "@/src/components/theme";
import { ApText } from "@/src/components/Text";
import { Ionicons } from "@expo/vector-icons";
import StatCard from "../../modules/profiles/components/StatCard";
import SettingsItem from "../../modules/profiles/components/SettingsItem";
import { useAuth } from "@/src/components/AuthContext";
import { authService } from "@/src/services/auth.service";
import { useProfile } from "@/hooks/useProfile";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();

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
          <ActivityIndicator color={ApTheme.Color.primary} />
        </View>
      </ApContainer>
    );
  }

  return (
    <ApContainer>
      <View className="h-screen bg-background">
        <ApHeader
          title="Profile"
          right={
            <TouchableOpacity>
              <Ionicons
                name="settings"
                size={24}
                color={ApTheme.Color.primary}
              />
            </TouchableOpacity>
          }
        />
        <ApScrollView showsVerticalScrollIndicator={false}>
          <View className="items-center mt-6 mb-8">
            <View className="relative">
              <View
                className="w-24 h-24 rounded-full items-center justify-center overflow-hidden border-2"
                style={{
                  backgroundColor: ApTheme.Color.surface,
                  borderColor: ApTheme.Color.primary,
                }}
              >
                {user?.avatar || profile?.avatar ? (
                  <Image
                    source={{ uri: user?.avatar || profile?.avatar }}
                    className="w-full h-full"
                  />
                ) : (
                  <ApText size="3xl" font="bold" color={ApTheme.Color.primary}>
                    {(user?.name || profile?.name)
                      ?.substring(0, 2)
                      .toUpperCase() || "HI"}
                  </ApText>
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-background">
                <Ionicons name="camera" size={12} color="black" />
              </View>
            </View>

            <ApText size="xl" font="bold" color="white" className="mt-4">
              {user?.name || profile?.name || "User"}
            </ApText>
            <ApText size="sm" color={ApTheme.Color.textMuted}>
              {user?.email || profile?.email || ""}
            </ApText>

            <TouchableOpacity className="mt-3 px-4 py-1.5 rounded-full border border-surface">
              <ApText size="xs" color={ApTheme.Color.primary} font="bold">
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
              color={ApTheme.Color.textMuted}
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
              <SettingsItem label="Sounds & Haptics" icon="musical-note" />
              <SettingsItem
                label="Appearance"
                icon="color-palette"
                value="Dark"
              />
            </View>

            <ApText
              size="sm"
              font="bold"
              color={ApTheme.Color.textMuted}
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
      </View>
    </ApContainer>
  );
}
