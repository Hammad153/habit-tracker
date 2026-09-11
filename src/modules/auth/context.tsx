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
  isAdminMode: boolean;
  isLoading: boolean;
  authStatus: AuthStatus;
  signIn: (tokens: IAuthTokens, user: IAuthUser) => Promise<void>;
  enterAdminMode: () => void;
  exitAdminMode: () => void;
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
  const [isAdminMode, setIsAdminMode] = useState(false);
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
      setIsAdminMode(false);
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
          return AuthService.getProfile()
            .then((serverUser) => {
              const hydratedUser = {
                ...userData,
                role: serverUser.role ?? userData.role,
              };
              setUser(hydratedUser);
              return ApStorageService.setItemAsync(
                ApStorageKeys.User,
                hydratedUser,
              );
            })
            .catch(() => {
              // Keep the cached session if profile hydration is temporarily unavailable.
              setUser(userData);
            })
            .finally(() => {
              setIsAdminMode(false);
              setAuthStatus("AUTHENTICATED");
            });
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
      return AuthService.getProfile()
        .then((serverUser) => {
          const hydratedUser = {
            ...userData,
            role: serverUser.role ?? userData.role,
          };
          setUser(hydratedUser);
          return ApStorageService.setItemAsync(
            ApStorageKeys.User,
            hydratedUser,
          );
        })
        .catch(() => {
          setUser(userData);
        })
        .finally(() => {
          setIsAdminMode(false);
          setAuthStatus("AUTHENTICATED");
        });
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
    setIsAdminMode(false);
    setAuthStatus("UNAUTHENTICATED");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdminMode,
        isLoading,
        authStatus,
        signIn,
        enterAdminMode: () => {
          if (user?.role === "ADMIN") setIsAdminMode(true);
        },
        exitAdminMode: () => setIsAdminMode(false),
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
