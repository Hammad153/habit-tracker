import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import * as WebBrowser from "expo-web-browser";
import { useAuthState } from "@/src/modules/auth/context";
import { ToastService } from "@/src/services";
import {
  IPlan,
  IPlansResponse,
  ISubscriptionInfo,
} from "./model";
import { SubscriptionApiService } from "./api";

interface IProps {
  children: ReactNode;
}

type TSubscriptionContext = {
  loading: boolean;
  subscription: ISubscriptionInfo | null;
  subscriptionLoaded: boolean;
  accessGranted: boolean;
  plans: IPlan[];
  plansCurrency: string;
  trialDurationDays: number;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  fetchSubscription: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  startCheckout: (planId: string) => Promise<boolean>;
  cancelSubscription: () => Promise<void>;
  resumeSubscription: () => Promise<void>;
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
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [plansCurrency, setPlansCurrency] = useState("NGN");
  const [trialDurationDays, setTrialDurationDays] = useState(7);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const checkoutInFlightRef = useRef(false);

  /** Central pricing always renders FROM the backend — never hardcoded here. */
  const fetchPlans = useCallback(() => {
    return SubscriptionApiService.getPlans()
      .then((data: IPlansResponse) => {
        setPlans(data.plans ?? []);
        setPlansCurrency(data.currency ?? "NGN");
        setTrialDurationDays(data.trialDurationDays ?? 7);
      })
      .catch((err) => {
        // Pricing is non-critical on boot; the screen retries via pull/retry.
        ToastService.ApiError(err);
      });
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const fetchSubscription = useCallback(() => {
    if (!user?.id) {
      setSubscription(null);
      setSubscriptionLoaded(false);
      return Promise.resolve();
    }
    setLoading(true);
    return SubscriptionApiService.get()
      .then((data) => {
        setSubscription(data);
        setSubscriptionLoaded(true);
      })
      .catch((err) => {
        // 403 SUBSCRIPTION_REQUIRED is still a valid, actionable state.
        if (err?.response?.status === 403) {
          setSubscriptionLoaded(true);
          return;
        }
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.id]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const startCheckout = useCallback(
    async (planId: string): Promise<boolean> => {
      if (checkoutInFlightRef.current) return false;
      checkoutInFlightRef.current = true;
      setLoading(true);
      try {
        const init = await SubscriptionApiService.checkout(planId);
        // Send the user to Paystack's hosted checkout (plan-backed → their
        // billing stays on-subscription). Returns when the browser closes.
        await WebBrowser.openAuthSessionAsync(init.authorizationUrl);
        // The browser redirect is never trusted — confirm server-side.
        const updated = await SubscriptionApiService.verify(init.reference);
        setSubscription(updated);
        setSubscriptionLoaded(true);
        ToastService.Success("Thank you! Your plan is active.");
        return true;
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 403) {
          ToastService.Error(
            "Payments aren't configured yet. Try again soon.",
          );
        } else if (err?.response?.data?.code === "PAYMENT_VERIFICATION_FAILED") {
          ToastService.Error("Payment was not completed. Please try again.");
        } else {
          ToastService.ApiError(err);
        }
        return false;
      } finally {
        checkoutInFlightRef.current = false;
        setLoading(false);
      }
    },
    [],
  );

  const cancelSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const updated = await SubscriptionApiService.cancel();
      setSubscription(updated);
      ToastService.Success("Your plan keeps working until the period ends.");
    } catch (err) {
      ToastService.ApiError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const resumeSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const updated = await SubscriptionApiService.resume();
      setSubscription(updated);
      ToastService.Success("Renewal resumed.");
    } catch (err) {
      ToastService.ApiError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAndPromptUpgrade = useCallback((): boolean => {
    if (subscription && !subscription.accessGranted) {
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
        subscriptionLoaded,
        accessGranted: subscription?.accessGranted ?? false,
        plans,
        plansCurrency,
        trialDurationDays,
        showUpgradeModal,
        setShowUpgradeModal,
        fetchSubscription,
        fetchPlans,
        startCheckout,
        cancelSubscription,
        resumeSubscription,
        checkAndPromptUpgrade,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};