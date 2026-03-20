import { toastEmitter } from "@/src/components/Toast";

export class ToastService {
  static Success = (msg: string) => {
    toastEmitter.emit({ type: "success", message: msg });
  };

  static Error = (msg: string) => {
    toastEmitter.emit({ type: "error", message: msg });
  };

  static ApiError = (error: any) => {
    const message =
      error?.response?.data?.message || error?.message || "An error occurred";
    ToastService.Error(message);
  };
}
