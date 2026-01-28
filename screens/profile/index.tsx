import React from "react";
import { View, Image, TouchableOpacity, Alert } from "react-native";
import { ApScrollView } from "@/components/ScrollView";
import ApContainer from "@/components/containers/container";
import { ApHeader } from "@/components/Header";
import { ApTheme } from "@/components/theme";
import { ApText } from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import StatCard from "./components/StatCard";
import SettingsItem from "./components/SettingsItem";
import { profileApi } from "@/libs/api";
import { useState, useEffect } from "react";
import { useAuth } from "@/src/components/AuthContext";
import { authService } from "@/src/services/auth.service";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileApi.get();
        setProfile(res.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
            // Even if backend logout fails, we sign out locally
            await signOut();
          }
        },
      },
    ]);
  };

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
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    className="w-full h-full"
                  />
                ) : (
                  <ApText size="3xl" font="bold" color={ApTheme.Color.primary}>
                    {user?.name?.substring(0, 2).toUpperCase() || "HI"}
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

          {/* Settings Section */}
          <View className="px-5 mb-20 space-y-2">
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
