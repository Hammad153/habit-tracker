import React, { useEffect } from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ApLoader,
  ApContainer,
  ApHeader,
  ApScrollView,
  ApText,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useRewardsState } from "./context";
import { IShopListItem } from "./model";

const ShopCard = ({
  item,
  balance,
  onRedeem,
}: {
  item: IShopListItem;
  balance: number;
  onRedeem: (item: IShopListItem) => void;
}) => {
  const colors = useTheme();
  const affordable = balance >= item.cost;

  return (
    <View
      className="rounded-2xl p-4 mb-3"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
      }}
    >
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center"
          style={{ backgroundColor: colors.primary + "20" }}
        >
          <Ionicons name="gift" size={22} color={colors.primary} />
        </View>
        <View className="flex-1 ml-3">
          <ApText size="base" font="semibold" color={colors.textPrimary}>
            {item.name}
          </ApText>
          {item.description ? (
            <ApText size="xs" color={colors.textMuted} numberOfLines={2}>
              {item.description}
            </ApText>
          ) : null}
        </View>
        <Ionicons name="ticket" size={16} color={colors.warning} />
        <ApText size="base" font="bold" color={colors.textPrimary} className="ml-1">
          {item.cost}
        </ApText>
      </View>

      <View className="mt-3">
        {item.owned ? (
          <View className="h-10 rounded-full items-center justify-center" style={{ backgroundColor: colors.success + "22" }}>
            <ApText size="sm" font="semibold" color={colors.success}>
              Owned
            </ApText>
          </View>
        ) : (
          <Pressable
            onPress={() => affordable && onRedeem(item)}
            accessibilityRole="button"
            accessibilityLabel={`Redeem ${item.name} for ${item.cost} coins`}
            disabled={!affordable}
            className="h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary + "22", opacity: affordable ? 1 : 0.5 }}
          >
            <ApText size="sm" font="semibold" color={colors.primary}>
              Redeem
            </ApText>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const RewardShopScreen = () => {
  const colors = useTheme();
  const {
    loading,
    balance,
    shopItems,
    fetchShop,
    fetchBalance,
    redeem,
  } = useRewardsState();

  useEffect(() => {
    fetchShop();
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && shopItems.length === 0) return <ApLoader />;

  return (
    <ApContainer>
      <ApHeader title="Reward Shop" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View
          className="mx-5 mt-2 rounded-2xl p-4 flex-row items-center"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder }}
        >
          <Ionicons name="cube" size={20} color={colors.warning} />
          <ApText size="lg" font="bold" color={colors.textPrimary} className="ml-2">
            {balance}
          </ApText>
          <ApText size="sm" color={colors.textMuted} className="ml-1">
            coins available
          </ApText>
        </View>

        <View className="px-5 mt-5 mb-10">
          {shopItems.length === 0 ? (
            <View className="items-center py-10">
              <Ionicons name="storefront-outline" size={28} color={colors.textMuted} />
              <ApText size="sm" color={colors.textMuted} className="mt-2">
                The shop is empty for now — earn coins and check back soon.
              </ApText>
            </View>
          ) : (
            shopItems.map((item) => (
              <ShopCard
                key={item.id}
                item={item}
                balance={balance}
                onRedeem={(i) => redeem(i.id)}
              />
            ))
          )}
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default RewardShopScreen;
