import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText, ApContainer, ApHeader, ApScrollView } from "@/src/components";
import { useSettingsState } from "./context";
import { useRewardsState } from "@/src/modules/rewards/context";
import { router } from "expo-router";

const AppearanceScreen = () => {
  const { themeMode, setThemeMode, colors } = useSettingsState();
  const { shopItems, fetchShop } = useRewardsState();

  useEffect(() => {
    fetchShop();
  }, []);

  const goldenOwned = shopItems.some((i) => i.key === "theme-golden" && i.owned);
  const focusOwned = shopItems.some((i) => i.key === "theme-focus" && i.owned);

  const themes = [
    { id: "light", label: "Light Theme", icon: "sunny", locked: false },
    { id: "dark", label: "Dark Theme", icon: "moon", locked: false },
    { id: "system", label: "System Default", icon: "settings", locked: false },
    { id: "golden", label: "Golden Theme (Reward)", icon: "color-palette", locked: !goldenOwned, cost: 500 },
    { id: "focus", label: "Focus Indigo (Reward)", icon: "leaf", locked: !focusOwned, cost: 300 },
  ];

  const handleSelect = (theme: typeof themes[0]) => {
    if (theme.locked) {
      router.push("/reward-shop");
    } else {
      setThemeMode(theme.id as any);
    }
  };

  return (
    <ApContainer className="flex-1">
      <ApHeader title="Appearance" hasBackButton />
      <ApScrollView className="flex-1 px-5 pt-6">
        <ApText
          size="xs"
          color={colors.textMuted}
          className="mb-3 uppercase tracking-wider"
          font="bold"
        >
          Theme Options
        </ApText>
        <View
          className="rounded-3xl overflow-hidden mb-6"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.surfaceBorder,
          }}
        >
          {themes.map((theme, index) => {
            const isSelected = themeMode === theme.id;
            return (
              <TouchableOpacity
                key={theme.id}
                onPress={() => handleSelect(theme)}
                activeOpacity={0.7}
                className={`flex-row items-center justify-between p-4 ${
                  index !== themes.length - 1 ? "border-b" : ""
                }`}
                style={{ borderBottomColor: colors.surfaceBorder }}
              >
                <View className="flex-row items-center flex-1 pr-2">
                  <View
                    className="w-10 h-10 rounded-2xl items-center justify-center mr-3.5"
                    style={{ backgroundColor: isSelected ? colors.primary + "20" : colors.background }}
                  >
                    <Ionicons
                      name={theme.icon as any}
                      size={20}
                      color={isSelected ? colors.primary : theme.locked ? colors.textMuted : colors.textSecondary}
                    />
                  </View>
                  <View>
                    <ApText
                      size="base"
                      color={isSelected ? colors.primary : colors.textPrimary}
                      font={isSelected ? "bold" : "medium"}
                    >
                      {theme.label}
                    </ApText>
                    {theme.locked && (
                      <ApText size="xs" color={colors.warning} font="medium">
                        Unlock in Reward Shop ({theme.cost} coins)
                      </ApText>
                    )}
                  </View>
                </View>

                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                ) : theme.locked ? (
                  <View className="flex-row items-center px-2.5 py-1 rounded-full" style={{ backgroundColor: colors.warning + "18" }}>
                    <Ionicons name="lock-closed" size={12} color={colors.warning} />
                    <ApText size="xs" font="bold" color={colors.warning} className="ml-1">
                      Shop
                    </ApText>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
        <ApText size="xs" color={colors.textMuted} className="px-2">
          Earn reward coins by completing daily habits to unlock premium custom themes and avatar frames.
        </ApText>
      </ApScrollView>
    </ApContainer>
  );
};

export default AppearanceScreen;
