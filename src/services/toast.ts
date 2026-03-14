import { ToastAndroid, Platform } from "react-native";

export class ToastService {
  static Success = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.LONG);
    } else if (Platform.OS === "web") {
      window.alert(msg);
    }
  };

  static Error = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.LONG);
    } else if (Platform.OS === "web") {
      window.alert(msg);
    }
  };

  static ApiError = (error: any) => {
    const message =
      error?.response?.data?.message || error?.message || "An error occurred";
    ToastService.Error(message);
  };
}
