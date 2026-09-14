import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Sun, Moon, Smartphone, Palette, Leaf, Check, Lock } from "lucide-react-native";
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
    { id: "light", label: "Light Theme", icon: Sun, locked: false },
    { id: "dark", label: "Dark Theme", icon: Moon, locked: false },
    { id: "system", label: "System Default", icon: Smartphone, locked: false },
    { id: "golden", label: "Golden Theme", icon: Palette, locked: !goldenOwned, cost: 500 },
    { id: "focus", label: "Focus Theme", icon: Leaf, locked: !focusOwned, cost: 300 },
  ];

  const handleSelect = (theme: (typeof themes)[0]) => {
    if (theme.locked) {
      router.push("/reward-shop");
    } else {
      setThemeMode(theme.id as any);
    }
  };

  return (
    <ApContainer>
      <ApHeader title="Appearance" hasBackButton />
      <ApScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <ApText
          size="xs"
          color={colors.textMuted}
          className="mb-2 uppercase"
          font="semibold"
          style={{ letterSpacing: 0.8 }}
        >
          Theme Options
        </ApText>
        <View
          className="rounded-2xl border overflow-hidden mb-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
          }}
        >
          {themes.map((theme, index) => {
            const isSelected = themeMode === theme.id;
            const IconComp = theme.icon;
            const showBorder = index < themes.length - 1;
            return (
              <TouchableOpacity
                key={theme.id}
                onPress={() => handleSelect(theme)}
                activeOpacity={0.7}
                className="flex-row items-center justify-between px-4 py-3.5"
                style={{
                  borderBottomWidth: showBorder ? 1 : 0,
                  borderBottomColor: colors.surfaceBorder,
                }}
              >
                <View className="flex-row items-center flex-1 pr-2">
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                    style={{
                      backgroundColor: isSelected
                        ? colors.accentLight
                        : colors.surface2,
                    }}
                  >
                    <IconComp
                      size={18}
                      color={isSelected ? colors.primary : colors.textMuted}
                    />
                  </View>
                  <View className="flex-1 justify-center">
                    <ApText
                      size="sm"
                      color={isSelected ? colors.primary : colors.textPrimary}
                      font={isSelected ? "semibold" : "medium"}
                    >
                      {theme.label}
                    </ApText>
                    {theme.locked && (
                      <ApText size="xs" color={colors.textMuted} className="mt-0.5">
                        Unlock in Reward Shop ({theme.cost} coins)
                      </ApText>
                    )}
                  </View>
                </View>

                {isSelected ? (
                  <Check size={18} color={colors.primary} strokeWidth={2.5} />
                ) : theme.locked ? (
                  <View
                    className="flex-row items-center px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: colors.surface2 }}
                  >
                    <Lock size={12} color={colors.textMuted} />
                    <ApText size="xs" font="medium" color={colors.textMuted} className="ml-1">
                      Shop
                    </ApText>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
        <ApText size="xs" color={colors.textMuted} className="px-1">
          Earn reward coins by completing daily habits to unlock premium custom themes.
        </ApText>
      </ApScrollView>
    </ApContainer>
  );
};

export default AppearanceScreen;
