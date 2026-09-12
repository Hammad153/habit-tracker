import React, { useEffect, useRef, useState } from "react";
import { View, Pressable, Dimensions } from "react-native";
import {
  Sparkles,
  Palette,
  Leaf,
  User,
  Gift,
  Check,
  Coins,
} from "lucide-react-native";
import {
  ApContainer,
  ApHeader,
  ApScrollView,
  ApText,
  ApEmptyState,
  ApConfirmModal,
  ApCard,
  SkeletonCard,
  SkeletonHabitList,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useRewardsState } from "./context";
import { IShopListItem } from "./model";
import { ToastService } from "@/src/services";
import ConfettiCannon from "react-native-confetti-cannon";
import * as Haptics from "expo-haptics";

const getItemIcon = (key: string, type: string) => {
  if (key.includes("golden")) return Palette;
  if (key.includes("focus")) return Leaf;
  if (type === "THEME" || type === "JOURNAL_THEME") return Palette;
  if (type === "AVATAR") return User;
  if (type === "CELEBRATION") return Sparkles;
  return Gift;
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
  const IconComp = getItemIcon(item.key, item.type);

  return (
    <ApCard className="p-4 mb-3">
      <View className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: colors.accentLight }}
        >
          <IconComp size={20} color={colors.primary} />
        </View>
        <View className="flex-1 mr-2">
          <ApText size="base" font="semibold" color={colors.textPrimary}>
            {item.name}
          </ApText>
          {item.description ? (
            <ApText size="xs" color={colors.textMuted} className="mt-0.5" numberOfLines={2}>
              {item.description}
            </ApText>
          ) : null}
        </View>
        <View
          className="flex-row items-center px-2.5 py-1 rounded-full"
          style={{ backgroundColor: colors.accentLight }}
        >
          <Coins size={12} color={colors.primary} />
          <ApText size="xs" font="semibold" color={colors.primary} className="ml-1">
            {item.cost}
          </ApText>
        </View>
      </View>

      <View className="mt-3">
        {item.owned ? (
          <View
            className="h-9 rounded-full items-center justify-center flex-row gap-1.5"
            style={{ backgroundColor: colors.surface2 }}
          >
            <Check size={14} color={colors.primary} />
            <ApText size="xs" font="semibold" color={colors.primary}>
              Unlocked & Owned
            </ApText>
          </View>
        ) : (
          <Pressable
            onPress={() => affordable && onRedeem(item)}
            accessibilityRole="button"
            accessibilityLabel={`Redeem ${item.name} for ${item.cost} coins`}
            disabled={!affordable}
            className="h-9 rounded-full items-center justify-center"
            style={{
              backgroundColor: affordable ? colors.primary : colors.surfaceInactive,
            }}
          >
            <ApText
              size="xs"
              font="semibold"
              color={affordable ? colors.background : colors.textMuted}
            >
              {affordable ? "Redeem Reward" : "Insufficient Coins"}
            </ApText>
          </Pressable>
        )}
      </View>
    </ApCard>
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

      if (item.key === "theme-golden") {
        setThemeMode("golden");
        ToastService.Success("Golden Theme unlocked and applied");
      } else if (item.key === "theme-focus") {
        setThemeMode("focus");
        ToastService.Success("Focus Theme unlocked and applied");
      } else if (item.key === "theme-journal") {
        ToastService.Success("Journal Theme unlocked");
      } else if (item.key === "avatar-frame-golden") {
        ToastService.Success("Golden Profile Frame unlocked");
      } else if (item.key === "pack-celebration") {
        ToastService.Success("Celebration Pack activated");
      } else {
        ToastService.Success(`${item.name} successfully unlocked`);
      }
    }
  };

  const isInitialLoading = loading && shopItems.length === 0;

  return (
    <ApContainer>
      <ApHeader title="Reward Shop" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        {/* Coin Balance Card */}
        <View className="mt-2 mb-4">
          {isInitialLoading ? (
            <SkeletonCard height={80} />
          ) : (
            <ApCard className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: colors.accentLight }}
                >
                  <Coins size={20} color={colors.primary} />
                </View>
                <View>
                  <ApText
                    size="xs"
                    font="medium"
                    color={colors.textMuted}
                    className="uppercase"
                    style={{ letterSpacing: 0.8 }}
                  >
                    Coin Balance
                  </ApText>
                  <ApText size="xl" font="semibold" color={colors.textPrimary}>
                    {balance} <ApText size="xs" color={colors.textMuted}>coins</ApText>
                  </ApText>
                </View>
              </View>
            </ApCard>
          )}
        </View>

        <View className="mb-10">
          {isInitialLoading ? (
            <SkeletonHabitList count={4} />
          ) : shopItems.length === 0 ? (
            <ApEmptyState
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
