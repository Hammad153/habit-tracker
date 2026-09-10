import Constants from "expo-constants";

const API_PORT = 3000;
const API_BASE_PATH = "/api/v1";

function resolveApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }

  const hostUri =
    Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;

  const host = hostUri?.split(":")[0];
  if (host) {
    return `http://${host}:${API_PORT}${API_BASE_PATH}`;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}${API_BASE_PATH}`;
  }

  return `http://localhost:${API_PORT}${API_BASE_PATH}`;
}

export const environment = {
  apiUrl: resolveApiUrl(),
};
