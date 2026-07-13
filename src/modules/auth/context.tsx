import React, { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApStorageService, ApStorageKeys } from "@/src/services";
import { IAuthUser, IAuthTokens } from "./model";
import { AuthService } from "./api";
import {
  AuthStatus,
  beginAuthLogout,
  clearStoredAuthSession,
  persistAuthSession,
  registerAuthLogoutHandler,
} from "./session";

interface IProps {
  children: React.ReactNode;
}

type TAuthContext = {
  user: IAuthUser | null;
  isLoading: boolean;
  authStatus: AuthStatus;
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
  const [authStatus, setAuthStatus] = useState<AuthStatus>("INITIALIZING");
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    return registerAuthLogoutHandler(() => {
      queryClient.cancelQueries();
      queryClient.clear();
      setUser(null);
      setAuthStatus("UNAUTHENTICATED");
    });
  }, [queryClient]);

  const loadUser = () => {
    Promise.all([
      ApStorageService.getItemAsync(ApStorageKeys.User),
      ApStorageService.getRawItemAsync(ApStorageKeys.AccessToken),
      ApStorageService.getRawItemAsync(ApStorageKeys.RefreshToken),
    ])
      .then(([userData, accessToken, refreshToken]) => {
        if (userData && accessToken && refreshToken) {
          setUser(userData);
          setAuthStatus("AUTHENTICATED");
        } else {
          setAuthStatus("UNAUTHENTICATED");
        }
      })
      .catch((e) => {
        console.error("Failed to load user", e);
        setAuthStatus("UNAUTHENTICATED");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const signIn = (tokens: IAuthTokens, userData: IAuthUser) => {
    return persistAuthSession(tokens, userData).then(() => {
      queryClient.clear();
      setUser(userData);
      setAuthStatus("AUTHENTICATED");
    });
  };

  const signOut = async () => {
    beginAuthLogout();
    try {
      await AuthService.logout();
    } catch {
      // ignore — proceed to clear local session regardless
    }

    await clearStoredAuthSession();
    await queryClient.cancelQueries();
    queryClient.clear();
    setUser(null);
    setAuthStatus("UNAUTHENTICATED");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, authStatus, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
