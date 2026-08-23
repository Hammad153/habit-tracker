import axiosInstance from "@/src/libs/axios";
import {
  IFreezeResult,
  IRedeemResult,
  IRewardBalance,
  IRewardTransaction,
  IShopListItem,
  ITemptationBundle,
} from "./model";

export class RewardsService {
  static getBalance = () => {
    return axiosInstance
      .get<IRewardBalance>("/reward/balance")
      .then((res) => res.data);
  };

  static listTransactions = () => {
    return axiosInstance
      .get<IRewardTransaction[]>("/reward/transactions")
      .then((res) => res.data);
  };

  /** Protects a missed scheduled day; server enforces cost + eligibility. */
  static freezeDay = (habitId: string, date: string) => {
    return axiosInstance
      .post<IFreezeResult>(`/habit/${habitId}/freeze`, { date })
      .then((res) => res.data);
  };

  static listShop = () => {
    return axiosInstance
      .get<IShopListItem[]>("/reward/shop")
      .then((res) => res.data);
  };

  static redeemItem = (itemId: string) => {
    return axiosInstance
      .post<IRedeemResult>(`/reward/shop/${itemId}/redeem`)
      .then((res) => res.data);
  };

  static listBundles = (habitId?: string) => {
    return axiosInstance
      .get<ITemptationBundle[]>("/temptation-bundle", {
        params: habitId ? { habitId } : undefined,
      })
      .then((res) => res.data);
  };

  static createBundle = (data: { habitId: string; title: string; description?: string }) => {
    return axiosInstance
      .post<ITemptationBundle>("/temptation-bundle", data)
      .then((res) => res.data);
  };

  static deleteBundle = (id: string) => {
    return axiosInstance
      .delete(`/temptation-bundle/${id}`)
      .then((res) => res.data);
  };

  /** LOCKED/USED bundles are rejected by the server's atomic guard. */
  static consumeBundle = (id: string) => {
    return axiosInstance
      .post<ITemptationBundle>(`/temptation-bundle/${id}/use`)
      .then((res) => res.data);
  };
}
