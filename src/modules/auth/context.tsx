import React, { createContext, useContext, useEffect, useState } from "react";
import { ApStorageService, ApStorageKeys } from "@/src/services";
import { IAuthUser, IAuthTokens } from "./model";

interface IProps {
  children: React.ReactNode;
}

type TAuthContext = {
  user: IAuthUser | null;
  isLoading: boolean;
  signIn: (tokens: IAuthTokens, user: IAuthUser) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<TAuthContext | undefined>(undefined);

export const useAuthState = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthState must be used within the AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<IProps> = ({ children }) => {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = () => {
    ApStorageService.getItemAsync(ApStorageKeys.User)
      .then((userData) => {
        if (userData) {
          setUser(userData);
        }
      })
      .catch((e) => {
        console.error("Failed to load user", e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const signIn = (tokens: IAuthTokens, userData: IAuthUser) => {
    return ApStorageService.setItemAsync(
      ApStorageKeys.AccessToken,
      tokens.access_token,
    )
      .then(() =>
        ApStorageService.setItemAsync(
          ApStorageKeys.RefreshToken,
          tokens.refresh_token,
        ),
      )
      .then(() => ApStorageService.setItemAsync(ApStorageKeys.User, userData))
      .then(() => {
        setUser(userData);
      });
  };

  const signOut = () => {
    return ApStorageService.removeItemAsync(ApStorageKeys.AccessToken)
      .then(() => ApStorageService.removeItemAsync(ApStorageKeys.RefreshToken))
      .then(() => ApStorageService.removeItemAsync(ApStorageKeys.User))
      .then(() => {
        setUser(null);
      });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
