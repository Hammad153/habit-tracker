import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export enum ApStorageKeys {
  AccessToken = "access_token",
  RefreshToken = "refresh_token",
  User = "user",
  SoundEnabled = "settings_sound_enabled",
  HapticEnabled = "settings_haptic_enabled",
  ThemeMode = "settings_theme_mode",
  JournalEntries = "journal_entries",
  AppNotifications = "app_notifications",
  OfflineRequestCache = "offline_request_cache",
  OfflineMutationQueue = "offline_mutation_queue",
}

const isWeb = Platform.OS === "web";

export class ApStorageService {
  public static getItemAsync = (key: ApStorageKeys) => {
    if (isWeb) {
      const value = localStorage.getItem(key);
      return Promise.resolve(value ? JSON.parse(value) : null);
    }
    return SecureStore.getItemAsync(key).then((value) => {
      if (value) {
        return JSON.parse(value);
      }
      return null;
    });
  };

  public static getRawItemAsync = (key: ApStorageKeys) => {
    if (isWeb) {
      return Promise.resolve(localStorage.getItem(key));
    }
    return SecureStore.getItemAsync(key);
  };

  public static setItemAsync = (key: ApStorageKeys, value: any) => {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    if (isWeb) {
      localStorage.setItem(key, stringValue);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, stringValue);
  };

  public static removeItemAsync = (key: ApStorageKeys) => {
    if (isWeb) {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  };

  public static clearAsync = () => {
    return Promise.all(
      Object.values(ApStorageKeys).map((key) =>
        ApStorageService.removeItemAsync(key),
      ),
    );
  };
}
