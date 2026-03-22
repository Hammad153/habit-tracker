type ToastType = "success" | "error" | "info";

export interface ToastPayload {
  type: ToastType;
  message: string;
}

type Listener = (payload: ToastPayload) => void;

class ToastEventEmitter {
  private listeners: Listener[] = [];

  on(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(payload: ToastPayload) {
    this.listeners.forEach((l) => l(payload));
  }
}

export const toastEmitter = new ToastEventEmitter();
