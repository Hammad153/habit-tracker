import axios, { AxiosError, InternalAxiosRequestConfig, create } from "axios";
import { ApStorageService, ApStorageKeys } from "@/src/services/storage";
import { environment } from "@/src/environment";
import {
  forceLogoutOnce,
  isAuthLogoutInProgress,
  replaceAuthTokens,
} from "@/src/modules/auth/session";
import { IAuthTokens } from "@/src/modules/auth/model";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _authRequest?: boolean;
};

const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/signup",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const PUBLIC_AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/signup",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/reset-password",
];

let refreshPromise: Promise<IAuthTokens> | null = null;

const rawClient = create({
  baseURL: environment.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const axiosInstance = create({
  baseURL: environment.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const requestPath = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http")) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  return url;
};

const isAuthEndpoint = (url?: string) => {
  const path = requestPath(url);
  return AUTH_ENDPOINTS.some((endpoint) => path.includes(endpoint));
};

const isPublicAuthEndpoint = (url?: string) => {
  const path = requestPath(url);
  return PUBLIC_AUTH_ENDPOINTS.some((endpoint) => path.includes(endpoint));
};

const authErrorCode = (error: any) => error?.response?.data?.code;

const shouldAttemptRefresh = (error: AxiosError, originalRequest: RetriableRequestConfig) => {
  if (error.response?.status !== 401) return false;
  if (originalRequest._retry || isAuthEndpoint(originalRequest.url)) return false;
  if (isAuthLogoutInProgress()) return false;
  if (!originalRequest._authRequest) return false;

  const code = authErrorCode(error);
  return !code || code === "ACCESS_TOKEN_EXPIRED" || code === "ACCESS_TOKEN_INVALID";
};

const isTerminalRefreshFailure = (error: any) => {
  const status = error?.response?.status;
  if (status !== 401 && status !== 403) return false;
  const code = authErrorCode(error);
  return (
    !code ||
    code === "REFRESH_TOKEN_EXPIRED" ||
    code === "REFRESH_TOKEN_INVALID" ||
    code === "REFRESH_TOKEN_REVOKED" ||
    code === "SESSION_NOT_FOUND" ||
    code === "SESSION_EXPIRED"
  );
};

const normalizeRefreshResponse = (data: any): IAuthTokens => ({
  access_token: data.access_token ?? data.accessToken,
  refresh_token: data.refresh_token ?? data.refreshToken,
});

const refreshTokensOnce = () => {
  if (!refreshPromise) {
    refreshPromise = ApStorageService.getRawItemAsync(ApStorageKeys.RefreshToken)
      .then((refreshToken) => {
        if (!refreshToken) {
          const error: any = new Error("No refresh token available");
          error.response = { status: 401, data: { code: "REFRESH_TOKEN_INVALID" } };
          throw error;
        }
        return rawClient.post("/auth/refresh", { refresh_token: refreshToken });
      })
      .then(async (response) => {
        const tokens = normalizeRefreshResponse(response.data);
        if (!tokens.access_token) throw new Error("Refresh response did not include an access token");
        await replaceAuthTokens(tokens);
        return tokens;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

axiosInstance.interceptors.request.use(
  async (config: RetriableRequestConfig) => {
    if (!isAuthEndpoint(config.url) && isAuthLogoutInProgress()) {
      return Promise.reject(new Error("Session expired"));
    }

    const token = await ApStorageService.getRawItemAsync(ApStorageKeys.AccessToken);
    if (token && !isPublicAuthEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
      config._authRequest = true;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    if (!originalRequest || !shouldAttemptRefresh(error, originalRequest)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const tokens = await refreshTokensOnce();
      originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
      originalRequest._authRequest = true;
      return axiosInstance(originalRequest);
    } catch (refreshError: any) {
      if (isTerminalRefreshFailure(refreshError)) {
        await forceLogoutOnce("SESSION_EXPIRED");
      }
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;
