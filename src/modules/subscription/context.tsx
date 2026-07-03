import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
} from "react";
import { useAuthState } from "@/src/modules/auth/context";
import { ToastService } from "@/src/services";
import { FREE_SUBSCRIPTION, ISubscriptionInfo, SubscriptionTier } from "./model";
import { SubscriptionApiService } from "./api";

interface IProps {
  children: ReactNode;
}

type TSubscriptionContext = {
  loading: boolean;
  subscription: ISubscriptionInfo | null;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  fetchSubscription: () => Promise<void>;
  updateSubscription: (tier: SubscriptionTier) => Promise<void>;
  checkAndPromptUpgrade: () => boolean;
};

export const SubscriptionContext = createContext<
  TSubscriptionContext | undefined
>(undefined);

export const useSubscriptionState = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscriptionState must be used within the SubscriptionProvider",
    );
  }
  return context;
};

export const SubscriptionProvider: React.FC<IProps> = ({ children }) => {
  const { user } = useAuthState();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] =
    useState<ISubscriptionInfo | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const fetchSubscription = useCallback(() => {
    if (!user?.id) return Promise.resolve();
    setLoading(true);
    return SubscriptionApiService.get(user.id)
      .then((data) => {
        setSubscription(data ?? FREE_SUBSCRIPTION);
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setSubscription(FREE_SUBSCRIPTION);
          return;
        }
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.id]);

  const updateSubscription = useCallback(
    (tier: SubscriptionTier) => {
      if (!user?.id) return Promise.resolve();
      setLoading(true);
      return SubscriptionApiService.update(user.id, tier)
        .then(() => {
          ToastService.Success("Subscription updated successfully");
          return fetchSubscription();
        })
        .catch((err) => {
          ToastService.ApiError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [user?.id, fetchSubscription],
  );

  const checkAndPromptUpgrade = useCallback((): boolean => {
    if (subscription && !subscription.canCreateHabit) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  }, [subscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        loading,
        subscription,
        showUpgradeModal,
        setShowUpgradeModal,
        fetchSubscription,
        updateSubscription,
        checkAndPromptUpgrade,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
