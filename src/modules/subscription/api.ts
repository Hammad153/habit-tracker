import axiosInstance from "@/src/libs/axios";
import {
  IPlansResponse,
  ISubscriptionInfo,
} from "./model";

export interface ICheckoutResponse {
  planId: string;
  reference: string;
  authorizationUrl: string;
}

/**
 * Thin client for the subscription API. The user is derived from the access
 * token server-side (no userId params — the old `?userId=` mock is gone).
 * Prices come from GET /subscription/plans, never hardcoded here.
 */
export class SubscriptionApiService {
  static get = (): Promise<ISubscriptionInfo> =>
    axiosInstance.get("/subscription").then((res) => res.data);

  static getPlans = (): Promise<IPlansResponse> =>
    axiosInstance.get("/subscription/plans").then((res) => res.data);

  static checkout = (planId: string): Promise<ICheckoutResponse> =>
    axiosInstance
      .post("/subscription/checkout", { planId })
      .then((res) => res.data);

  static verify = (reference: string): Promise<ISubscriptionInfo> =>
    axiosInstance
      .post("/subscription/verify", { reference })
      .then((res) => res.data);

  static cancel = (): Promise<ISubscriptionInfo> =>
    axiosInstance.post("/subscription/cancel").then((res) => res.data);

  static resume = (): Promise<ISubscriptionInfo> =>
    axiosInstance.post("/subscription/resume").then((res) => res.data);

  static transactions = () =>
    axiosInstance.get("/subscription/transactions").then((res) => res.data);
}