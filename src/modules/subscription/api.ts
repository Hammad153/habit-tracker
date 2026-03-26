import axiosInstance from "@/src/libs/axios";
import { SubscriptionTier } from "./model";

export class SubscriptionApiService {
  static get = (userId: string) => {
    return axiosInstance
      .get(`/subscription?userId=${userId}`)
      .then((res) => res.data);
  };

  static update = (userId: string, tier: SubscriptionTier) => {
    return axiosInstance
      .patch("/subscription", { userId, tier })
      .then((res) => res.data);
  };
}
