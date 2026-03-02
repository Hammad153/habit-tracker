import { ToastAndroid, Platform } from "react-native";

export class ToastService {
  static Success = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.LONG);
    }
  };

  static Error = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.LONG);
    }
  };

  static ApiError = (error: any) => {
    const message =
      error?.response?.data?.message || error?.message || "An error occurred";
    ToastService.Error(message);
  };
}
