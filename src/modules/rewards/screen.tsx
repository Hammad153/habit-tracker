import React, { useEffect, useRef, useState } from "react";
import { View, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ApLoader,
  ApContainer,
  ApHeader,
  ApScrollView,
  ApText,
  ApEmptyState,
  ApConfirmModal,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useRewardsState } from "./context";
import { IShopListItem } from "./model";
import { ToastService } from "@/src/services";
import ConfettiCannon from "react-native-confetti-cannon";
import * as Haptics from "expo-haptics";

const getItemIcon = (key: string, type: string) => {
  if (key.includes("golden")) return "color-palette";
  if (key.includes("focus")) return "leaf";
  if (type === "THEME" || type === "JOURNAL_THEME") return "color-palette-outline";
  if (type === "AVATAR") return "person-circle-outline";
  if (type === "CELEBRATION") return "sparkles";
  return "gift-outline";
};

const ShopCard = ({
  item,
  balance,
  onRedeem,
}: {
  item: IShopListItem;
  balance: number;
  onRedeem: (item: IShopListItem) => void;
}) => {
  const { colors } = useSettingsState();
  const affordable = balance >= item.cost;
  const iconName = getItemIcon(item.key, item.type);

  return (
    <View
      className="rounded-3xl p-4 mb-4"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
      }}
    >
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: colors.primary + "18" }}
        >
          <Ionicons name={iconName as any} size={22} color={colors.primary} />
        </View>
        <View className="flex-1 ml-3.5">
          <ApText size="base" font="bold" color={colors.textPrimary}>
            {item.name}
          </ApText>
          {item.description ? (
            <ApText size="xs" color={colors.textMuted} className="mt-0.5" numberOfLines={2}>
              {item.description}
            </ApText>
          ) : null}
        </View>
        <View className="flex-row items-center px-3 py-1 rounded-full" style={{ backgroundColor: colors.warning + "18" }}>
          <Ionicons name="diamond" size={14} color={colors.warning} />
          <ApText size="sm" font="bold" color={colors.warning} className="ml-1">
            {item.cost}
          </ApText>
        </View>
      </View>

      <View className="mt-3">
        {item.owned ? (
          <View className="h-11 rounded-full items-center justify-center flex-row gap-1.5" style={{ backgroundColor: colors.success + "1F" }}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <ApText size="sm" font="bold" color={colors.success}>
              Unlocked & Owned
            </ApText>
          </View>
        ) : (
          <Pressable
            onPress={() => affordable && onRedeem(item)}
            accessibilityRole="button"
            accessibilityLabel={`Redeem ${item.name} for ${item.cost} coins`}
            disabled={!affordable}
            className="h-11 rounded-full items-center justify-center flex-row gap-1.5"
            style={{
              backgroundColor: affordable ? colors.primary : colors.surfaceBorder,
              opacity: affordable ? 1 : 0.6,
            }}
          >
            <ApText size="sm" font="bold" color={affordable ? colors.background : colors.textMuted}>
              {affordable ? "Redeem Reward" : "Insufficient Coins"}
            </ApText>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const RewardShopScreen = () => {
  const { colors, setThemeMode } = useSettingsState();
  const {
    loading,
    balance,
    shopItems,
    fetchShop,
    fetchBalance,
    redeem,
  } = useRewardsState();

  const [selectedItem, setSelectedItem] = useState<IShopListItem | null>(null);
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    fetchShop();
    fetchBalance();
  }, []);

  const handleConfirmRedeem = async () => {
    if (!selectedItem) return;
    const item = selectedItem;
    setSelectedItem(null);

    const res = await redeem(item.id);
    if (res) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      confettiRef.current?.start();

      // Apply the redeemed reward immediately
      if (item.key === "theme-golden") {
        setThemeMode("golden");
        ToastService.Success("🎉 Golden Theme unlocked and applied to app!");
      } else if (item.key === "theme-focus") {
        setThemeMode("focus");
        ToastService.Success("🎉 Focus Theme unlocked and applied to app!");
      } else if (item.key === "theme-journal") {
        ToastService.Success("📖 Journal Theme unlocked for your reflections!");
      } else if (item.key === "avatar-frame-golden") {
        ToastService.Success("✨ Golden Profile Frame unlocked!");
      } else if (item.key === "pack-celebration") {
        ToastService.Success("🎉 Celebration Pack activated!");
      } else {
        ToastService.Success(`🎉 ${item.name} successfully unlocked!`);
      }
    }
  };

  if (loading && shopItems.length === 0) return <ApLoader />;

  return (
    <ApContainer>
      <ApHeader title="Reward Shop" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View
          className="mx-5 mt-2 rounded-3xl p-4 flex-row items-center justify-between"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder }}
        >
          <View className="flex-row items-center">
            <View
              className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
              style={{ backgroundColor: colors.warning + "20" }}
            >
              <Ionicons name="diamond" size={20} color={colors.warning} />
            </View>
            <View>
              <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase">
                Coin Balance
              </ApText>
              <ApText size="xl" font="bold" color={colors.textPrimary}>
                {balance} <ApText size="sm" color={colors.textMuted}>coins</ApText>
              </ApText>
            </View>
          </View>
        </View>

        <View className="px-5 mt-5 mb-10">
          {shopItems.length === 0 ? (
            <ApEmptyState
              icon="storefront-outline"
              title="The shop is empty"
              subtitle="Earn coins from completing daily habits and check back soon."
            />
          ) : (
            shopItems.map((item) => (
              <ShopCard
                key={item.id}
                item={item}
                balance={balance}
                onRedeem={(i) => setSelectedItem(i)}
              />
            ))
          )}
        </View>
      </ApScrollView>

      <ApConfirmModal
        visible={!!selectedItem}
        title={`Redeem ${selectedItem?.name}?`}
        subTitle={`This will deduct ${selectedItem?.cost} coins from your balance (${balance - (selectedItem?.cost || 0)} remaining).`}
        confirmText="Confirm Redemption"
        onClose={() => setSelectedItem(null)}
        onConfirm={handleConfirmRedeem}
      />

      <ConfettiCannon
        count={200}
        origin={{ x: Dimensions.get("window").width / 2, y: 0 }}
        autoStart={false}
        ref={confettiRef}
        fadeOut
        fallSpeed={1800}
        explosionSpeed={400}
        autoStartDelay={0}
      />
    </ApContainer>
  );
};

export default RewardShopScreen;
