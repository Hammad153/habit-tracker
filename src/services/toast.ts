import { ToastAndroid, Platform } from "react-native";

export const toast = {
  show: (message: string, type: "success" | "error" | "warning" | "info") => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      //  ToastIOS.show(message);
    }
  },
};
