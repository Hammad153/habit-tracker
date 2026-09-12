import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from "react";
import { Text, Animated, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle2, AlertCircle, Info } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";
import { toastEmitter, ToastPayload } from "@/src/services/toast-emitter";

interface ToastContextType {
  showToast: (options: ToastPayload) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const translateY = useRef(new Animated.Value(16)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 16,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [opacity, translateY, scale]);

  const showToast = useCallback(
    (options: ToastPayload) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast(options);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();

      hideTimer.current = setTimeout(hideToast, 2800);
    },
    [hideToast, opacity, translateY, scale]
  );

  useEffect(() => {
    const unsubscribe = toastEmitter.on(showToast);
    return () => {
      unsubscribe();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [showToast]);

  // Tab bar height is 60. Bottom offset is Math.max(16, insets.bottom).
  // Position toast with 16px of clearance above the floating tab bar:
  const tabBottomOffset = Math.max(16, insets.bottom > 0 ? insets.bottom : 16);
  const toastBottom = tabBottomOffset + 60 + 16;

  const type = toast?.type || "info";
  const iconConfig = {
    success: {
      icon: CheckCircle2,
      color: colors.success,
      bg: colors.successSoft,
    },
    error: {
      icon: AlertCircle,
      color: colors.danger,
      bg: colors.dangerSoft,
    },
    info: {
      icon: Info,
      color: colors.accent,
      bg: colors.accentSoft,
    },
  }[type];

  const IconComponent = iconConfig.icon;

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      <View style={{ flex: 1 }}>
        {children}
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {toast && (
            <Animated.View
              pointerEvents="none"
              className="absolute left-4 right-4 items-center z-50"
              style={{
                bottom: toastBottom,
                transform: [{ translateY }, { scale }],
                opacity,
              }}
            >
              <View
                className="min-h-[46px] px-4 py-2.5 rounded-full flex-row items-center max-w-[92%]"
                style={{
                  backgroundColor: colors.backgroundElevated,
                  borderColor: colors.border,
                  borderWidth: StyleSheet.hairlineWidth,
                  shadowColor: colors.inkPrimary,
                  shadowOpacity: 0.1,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 6,
                }}
              >
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mr-2.5"
                  style={{ backgroundColor: iconConfig.bg }}
                >
                  <IconComponent size={14} color={iconConfig.color} strokeWidth={2.5} />
                </View>
                <Text
                  className="text-[13.5px] leading-[18px] font-semibold text-ink-primary"
                  numberOfLines={2}
                >
                  {toast.message}
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </View>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export default ToastProvider;
