import { ToastService } from "@/src/services/toast";
import { ApStorageKeys, ApStorageService } from "@/src/services/storage";
import { IAuthTokens, IAuthUser } from "./model";

export type AuthStatus =
  | "INITIALIZING"
  | "AUTHENTICATED"
  | "UNAUTHENTICATED"
  | "REFRESHING";

export type LogoutReason = "USER_INITIATED" | "SESSION_EXPIRED";

type LogoutHandler = (reason: LogoutReason) => Promise<void> | void;

let logoutHandler: LogoutHandler | null = null;
let logoutPromise: Promise<void> | null = null;
let isLoggingOut = false;
let sessionExpiredToastShown = false;

export const registerAuthLogoutHandler = (handler: LogoutHandler) => {
  logoutHandler = handler;
  return () => {
    if (logoutHandler === handler) logoutHandler = null;
  };
};

export const isAuthLogoutInProgress = () => isLoggingOut;

export const beginAuthLogout = () => {
  isLoggingOut = true;
};

export const resetAuthLifecycle = () => {
  isLoggingOut = false;
  logoutPromise = null;
  sessionExpiredToastShown = false;
};

export const clearStoredAuthSession = async () => {
  await Promise.all([
    ApStorageService.removeItemAsync(ApStorageKeys.AccessToken),
    ApStorageService.removeItemAsync(ApStorageKeys.RefreshToken),
    ApStorageService.removeItemAsync(ApStorageKeys.User),
  ]);
};

export const replaceAuthTokens = async (tokens: Partial<IAuthTokens>) => {
  if (tokens.access_token) {
    await ApStorageService.setItemAsync(ApStorageKeys.AccessToken, tokens.access_token);
  }
  if (tokens.refresh_token) {
    await ApStorageService.setItemAsync(ApStorageKeys.RefreshToken, tokens.refresh_token);
  }
};

export const persistAuthSession = async (tokens: IAuthTokens, user: IAuthUser) => {
  await replaceAuthTokens(tokens);
  await ApStorageService.setItemAsync(ApStorageKeys.User, user);
  resetAuthLifecycle();
};

export const forceLogoutOnce = (reason: LogoutReason = "SESSION_EXPIRED") => {
  if (logoutPromise) return logoutPromise;
  if (isLoggingOut) return Promise.resolve();

  isLoggingOut = true;
  logoutPromise = clearStoredAuthSession()
    .then(async () => {
      if (reason === "SESSION_EXPIRED" && !sessionExpiredToastShown) {
        sessionExpiredToastShown = true;
        ToastService.Error("Your session has expired. Please sign in again.");
      }
      await logoutHandler?.(reason);
    })
    .finally(() => {
      logoutPromise = null;
    });

  return logoutPromise;
};
