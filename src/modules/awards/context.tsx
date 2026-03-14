import React, { createContext, ReactNode, useContext, useState } from "react";
import { ToastService } from "@/src/services";
import { useAuthState } from "@/src/modules/auth/context";
import { IBadge, IUserBadge } from "./model";
import { AwardsService } from "./api";

interface IProps {
  children: ReactNode;
}

type TAwardsContext = {
  loading: boolean;
  badges: IBadge[];
  userBadges: IUserBadge[];
  fetchBadges: () => Promise<void>;
  fetchUserBadges: () => Promise<void>;
};

export const AwardsContext = createContext<TAwardsContext | undefined>(
  undefined,
);

export const useAwardsState = () => {
  const context = useContext(AwardsContext);
  if (context === undefined) {
    throw new Error("useAwardsState must be used within the AwardsProvider");
  }
  return context;
};

export const AwardsProvider: React.FC<IProps> = ({ children }) => {
  const { user } = useAuthState();
  const [loading, setLoading] = useState(false);
  const [badges, setBadges] = useState<IBadge[]>([]);
  const [userBadges, setUserBadges] = useState<IUserBadge[]>([]);

  const fetchBadges = () => {
    setLoading(true);
    return AwardsService.getAll()
      .then((data) => {
        if (data) {
          setBadges(data);
        }
      })
      .catch((err) => {
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchUserBadges = () => {
    setLoading(true);
    return AwardsService.getUserBadges(user!.id)
      .then((data) => {
        if (data) {
          setUserBadges(data);
        }
      })
      .catch((err) => {
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AwardsContext.Provider
      value={{
        loading,
        badges,
        userBadges,
        fetchBadges,
        fetchUserBadges,
      }}
    >
      {children}
    </AwardsContext.Provider>
  );
};
