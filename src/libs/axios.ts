import axios from "axios";
import { ApStorageService, ApStorageKeys } from "@/src/services/storage";
import { environment } from "@/src/environment";

const axiosInstance = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    return ApStorageService.getRawItemAsync(ApStorageKeys.AccessToken).then(
      (token) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
    );
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/signup") ||
      originalRequest.url?.includes("/auth/refresh");
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      return ApStorageService.getRawItemAsync(ApStorageKeys.RefreshToken)
        .then((refreshToken) => {
          return axios.post(`${environment.apiUrl}/auth/refresh`, {
            refresh_token: refreshToken,
          });
        })
        .then((response) => {
          const { access_token } = response.data;
          return ApStorageService.setItemAsync(
            ApStorageKeys.AccessToken,
            access_token,
          ).then(() => {
            axiosInstance.defaults.headers.common["Authorization"] =
              `Bearer ${access_token}`;
            return axiosInstance(originalRequest);
          });
        })
        .catch((refreshError) => {
          return ApStorageService.removeItemAsync(ApStorageKeys.AccessToken)
            .then(() =>
              ApStorageService.removeItemAsync(ApStorageKeys.RefreshToken),
            )
            .then(() => Promise.reject(refreshError));
        });
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
