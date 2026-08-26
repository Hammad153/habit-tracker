import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ToastService } from "@/src/services";
import {
  IFreezeResult,
  IRedeemResult,
  IRewardBalance,
  IRewardTransaction,
  IShopListItem,
} from "./model";
import { RewardsService } from "./api";

interface IProps {
  children: ReactNode;
}

type TRewardsContext = {
  balance: number;
  shopItems: IShopListItem[];
  transactions: IRewardTransaction[];
  loading: boolean;
  fetchBalance: () => Promise<IRewardBalance | undefined>;
  fetchShop: () => Promise<IShopListItem[] | undefined>;
  fetchTransactions: () => Promise<IRewardTransaction[] | undefined>;
  redeem: (itemId: string) => Promise<IRedeemResult | undefined>;
  freezeDay: (habitId: string, date: string) => Promise<IFreezeResult | undefined>;
};

export const RewardsContext = createContext<TRewardsContext | undefined>(
  undefined,
);

export const useRewardsState = () => {
  const context = useContext(RewardsContext);
  if (context === undefined) {
    throw new Error("useRewardsState must be used within the RewardsProvider");
  }
  return context;
};

export const RewardsProvider: React.FC<IProps> = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [shopItems, setShopItems] = useState<IShopListItem[]>([]);
  const [transactions, setTransactions] = useState<IRewardTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(() => {
    return RewardsService.getBalance()
      .then((data) => {
        if (data && typeof data.balance === "number") setBalance(data.balance);
        return data;
      })
      .catch((err) => {
        ToastService.ApiError(err);
        return undefined;
      });
  }, []);

  const fetchShop = useCallback(() => {
    setLoading(true);
    return RewardsService.listShop()
      .then((data) => {
        if (data) setShopItems(data);
        return data;
      })
      .catch((err) => {
        ToastService.ApiError(err);
        return undefined;
      })
      .finally(() => setLoading(false));
  }, []);

  const fetchTransactions = useCallback(() => {
    return RewardsService.listTransactions()
      .then((data) => {
        if (data) setTransactions(data);
        return data;
      })
      .catch((err) => {
        ToastService.ApiError(err);
        return undefined;
      });
  }, []);

  /** Server is the source of truth; remainingCoins refreshes the local cache. */
  const redeem = useCallback((itemId: string) => {
    return RewardsService.redeemItem(itemId)
      .then((result) => {
        if (result && typeof result.remainingCoins === "number") {
          setBalance(result.remainingCoins);
        }
        // Ownership flag changes for everyone browsing the shop.
        return fetchShop().then(() => result);
      })
      .catch((err) => {
        ToastService.ApiError(err);
        return undefined;
      });
  }, [fetchShop]);

  const freezeDay = useCallback((habitId: string, date: string) => {
    return RewardsService.freezeDay(habitId, date)
      .then((result) => {
        if (result) {
          setBalance((b) => b - (result.cost ?? 0));
          ToastService.Success(
            `Streak protected — ${result.cost} coins used`,
          );
        }
        return result;
      })
      .catch((err) => {
        ToastService.ApiError(err);
        return undefined;
      });
  }, []);

  useEffect(() => {
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      balance,
      shopItems,
      transactions,
      loading,
      fetchBalance,
      fetchShop,
      fetchTransactions,
      redeem,
      freezeDay,
    }),
    [
      balance,
      shopItems,
      transactions,
      loading,
      fetchBalance,
      fetchShop,
      fetchTransactions,
      redeem,
      freezeDay,
    ],
  );

  return (
    <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>
  );
};
