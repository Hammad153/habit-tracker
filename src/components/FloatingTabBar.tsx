import React, { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { Home, Calendar, User, Plus, X, Search } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFeedback } from "@/src/utils/feedback";

// 3-pill capsule progress icon matching the reference design
const ProgressIcon: React.FC<{ color: string }> = ({ color }) => {
  return (
    <View
      style={{
        width: 22,
        height: 20,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 3,
        paddingBottom: 1,
      }}
    >
      <View
        style={{
          width: 4.5,
          height: 13,
          borderRadius: 2.5,
          borderWidth: 1.6,
          borderColor: color,
        }}
      />
      <View
        style={{
          width: 4.5,
          height: 18,
          borderRadius: 2.5,
          borderWidth: 1.6,
          borderColor: color,
        }}
      />
      <View
        style={{
          width: 4.5,
          height: 11,
          borderRadius: 2.5,
          borderWidth: 1.6,
          borderColor: color,
        }}
      />
    </View>
  );
};

interface TabConfig {
  name: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color: string; strokeWidth?: number }>;
}

const TAB_CONFIGS: TabConfig[] = [
  { name: "index", label: "Home", icon: Home },
  { name: "progress", label: "Progress", icon: ProgressIcon },
  { name: "daily-plan", label: "Daily Plan", icon: Calendar },
  { name: "profile", label: "Profile", icon: User },
];

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { triggerSelection } = useFeedback();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const bottomOffset = Math.max(16, insets.bottom > 0 ? insets.bottom : 16);

  const handleOpenMenu = () => {
    triggerSelection();
    setIsMenuOpen(true);
  };

  const handleCloseMenu = () => {
    triggerSelection();
    setIsMenuOpen(false);
  };

  const handleSelectOption = (path: string) => {
    triggerSelection();
    setIsMenuOpen(false);
    router.push(path as any);
  };

  return (
    <>
      <View
        className="absolute left-4 right-4 flex-row items-center justify-between"
        style={{
          bottom: bottomOffset,
        }}
        pointerEvents="box-none"
      >
        {/* 4-Tab Pill Bar */}
        <View
          className="flex-1 flex-row items-center justify-around rounded-full border"
          style={{
            height: 58,
            backgroundColor: colors.surfaceElevated || colors.background,
            borderColor: colors.border,
            shadowColor: colors.inkPrimary,
            shadowOpacity: 0.08,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
            paddingHorizontal: 4,
          }}
        >
          {TAB_CONFIGS.map((tab) => {
            const route = state.routes.find((r) => r.name === tab.name);
            const isFocused = state.routes[state.index]?.name === tab.name;
            const IconComponent = tab.icon;

            const onPress = () => {
              if (!route) {
                navigation.navigate(tab.name);
                return;
              }

              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              if (route) {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              }
            };

            return (
              <Pressable
                key={tab.name}
                accessibilityRole="button"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={tab.label}
                onPress={onPress}
                onLongPress={onLongPress}
                className="flex-1 items-center justify-center py-1 active:opacity-75"
                hitSlop={4}
              >
                {/* Capsule highlight behind active icon */}
                <View
                  className="items-center justify-center"
                  style={{
                    width: 50,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: isFocused
                      ? colors.surface2 || colors.backgroundSurface2
                      : "transparent",
                  }}
                >
                  <IconComponent
                    size={19}
                    color={isFocused ? colors.inkPrimary : colors.inkTertiary}
                    strokeWidth={2}
                  />
                </View>

                {/* Label */}
                <Text
                  numberOfLines={1}
                  className="text-[10px] tracking-tight mt-0.5"
                  style={{
                    color: isFocused ? colors.inkPrimary : colors.inkTertiary,
                    fontWeight: isFocused ? "600" : "500",
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Standalone Circular Plus Button to Open Options Menu */}
        <Pressable
          onPress={handleOpenMenu}
          accessibilityRole="button"
          accessibilityLabel="Add habit options"
          className="items-center justify-center rounded-full active:opacity-80 active:scale-95"
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: colors.inkPrimary,
            marginLeft: 10,
            shadowColor: colors.inkPrimary,
            shadowOpacity: 0.16,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 4 },
            elevation: 5,
          }}
        >
          <Plus size={24} color={colors.inkInverse} strokeWidth={2.4} />
        </Pressable>
      </View>

      {/* 2-Option Popup Modal (Exact Cal AI Style) */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCloseMenu}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: colors.overlay,
            justifyContent: "flex-end",
          }}
          onPress={handleCloseMenu}
        >
          <View
            style={{
              paddingBottom: bottomOffset,
              paddingHorizontal: 16,
            }}
            pointerEvents="box-none"
          >
            {/* 2 Options Cards Side-by-Side */}
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginBottom: 16,
              }}
              pointerEvents="box-none"
            >
              {/* Option 1: Habit Database */}
              <Pressable
                onPress={() => handleSelectOption("/templates")}
                accessibilityRole="button"
                accessibilityLabel="Habit Database"
                className="active:opacity-85 active:scale-[0.98]"
                style={{
                  flex: 1,
                  height: 126,
                  borderRadius: 24,
                  backgroundColor: colors.surfaceElevated || colors.background,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 18,
                  paddingHorizontal: 12,
                  shadowColor: colors.inkPrimary,
                  shadowOpacity: 0.08,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                }}
              >
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 18,
                    backgroundColor: colors.surface2 || colors.backgroundSurface2,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Search size={26} color={colors.inkPrimary} strokeWidth={2.8} />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.inkPrimary,
                    textAlign: "center",
                    letterSpacing: -0.2,
                  }}
                >
                  Habit Database
                </Text>
              </Pressable>

              {/* Option 2: Create Habit */}
              <Pressable
                onPress={() => handleSelectOption("/create-habit")}
                accessibilityRole="button"
                accessibilityLabel="Create Habit"
                className="active:opacity-85 active:scale-[0.98]"
                style={{
                  flex: 1,
                  height: 126,
                  borderRadius: 24,
                  backgroundColor: colors.surfaceElevated || colors.background,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 18,
                  paddingHorizontal: 12,
                  shadowColor: colors.inkPrimary,
                  shadowOpacity: 0.08,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                }}
              >
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 18,
                    backgroundColor: colors.surface2 || colors.backgroundSurface2,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Plus size={28} color={colors.inkPrimary} strokeWidth={2.8} />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.inkPrimary,
                    textAlign: "center",
                    letterSpacing: -0.2,
                  }}
                >
                  Create Habit
                </Text>
              </Pressable>
            </View>

            {/* Bottom Row with Tab Bar and Close Button */}
            <View
              className="flex-row items-center justify-between"
              pointerEvents="box-none"
            >
              {/* 4-Tab Pill Bar */}
              <View
                className="flex-1 flex-row items-center justify-around rounded-full border"
                style={{
                  height: 58,
                  backgroundColor: colors.surfaceElevated || colors.background,
                  borderColor: colors.border,
                  shadowColor: colors.inkPrimary,
                  shadowOpacity: 0.08,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                  paddingHorizontal: 4,
                }}
              >
                {TAB_CONFIGS.map((tab) => {
                  const isFocused = state.routes[state.index]?.name === tab.name;
                  const IconComponent = tab.icon;

                  return (
                    <Pressable
                      key={tab.name}
                      accessibilityRole="button"
                      accessibilityLabel={tab.label}
                      onPress={() => {
                        handleCloseMenu();
                        const route = state.routes.find((r) => r.name === tab.name);
                        if (route && !isFocused) {
                          navigation.navigate(route.name);
                        }
                      }}
                      className="flex-1 items-center justify-center py-1 active:opacity-75"
                      hitSlop={4}
                    >
                      <View
                        className="items-center justify-center"
                        style={{
                          width: 50,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: isFocused
                            ? colors.surface2 || colors.backgroundSurface2
                            : "transparent",
                        }}
                      >
                        <IconComponent
                          size={19}
                          color={isFocused ? colors.inkPrimary : colors.inkTertiary}
                          strokeWidth={2}
                        />
                      </View>
                      <Text
                        numberOfLines={1}
                        className="text-[10px] tracking-tight mt-0.5"
                        style={{
                          color: isFocused ? colors.inkPrimary : colors.inkTertiary,
                          fontWeight: isFocused ? "600" : "500",
                        }}
                      >
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Standalone Circular Button with X to Close */}
              <Pressable
                onPress={handleCloseMenu}
                accessibilityRole="button"
                accessibilityLabel="Close menu"
                className="items-center justify-center rounded-full active:opacity-80 active:scale-95"
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: colors.inkPrimary,
                  marginLeft: 10,
                  shadowColor: colors.inkPrimary,
                  shadowOpacity: 0.16,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 5,
                }}
              >
                <X size={24} color={colors.inkInverse} strokeWidth={2.4} />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default FloatingTabBar;
