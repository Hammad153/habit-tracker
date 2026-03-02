import * as SecureStore from "expo-secure-store";

export enum ApStorageKeys {
  AccessToken = "access_token",
  RefreshToken = "refresh_token",
  User = "user",
  SoundEnabled = "settings_sound_enabled",
  HapticEnabled = "settings_haptic_enabled",
  ThemeMode = "settings_theme_mode",
}

export class ApStorageService {
  public static getItemAsync = (key: ApStorageKeys) => {
    return SecureStore.getItemAsync(key).then((value) => {
      if (value) {
        return JSON.parse(value);
      }
      return null;
    });
  };

  public static getRawItemAsync = (key: ApStorageKeys) => {
    return SecureStore.getItemAsync(key);
  };

  public static setItemAsync = (key: ApStorageKeys, value: any) => {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    return SecureStore.setItemAsync(key, stringValue);
  };

  public static removeItemAsync = (key: ApStorageKeys) => {
    return SecureStore.deleteItemAsync(key);
  };

  public static clearAsync = () => {
    return Promise.all(
      Object.values(ApStorageKeys).map((key) =>
        SecureStore.deleteItemAsync(key),
      ),
    );
  };
}
