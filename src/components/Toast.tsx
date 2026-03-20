import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/src/modules/settings/context";

// ─── Event Emitter ───────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface ToastPayload {
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

// ─── Config ──────────────────────────────────────────────────────────────────

const TOAST_DURATION = 3000;
const SCREEN_WIDTH = Dimensions.get("window").width;

const variantConfig: Record<
  ToastType,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bgTint: string }
> = {
  success: {
    icon: "checkmark-circle",
    color: "#10b981",
    bgTint: "rgba(16, 185, 129, 0.12)",
  },
  error: {
    icon: "alert-circle",
    color: "#EF4444",
    bgTint: "rgba(239, 68, 68, 0.12)",
  },
  info: {
    icon: "information-circle",
    color: "#3B82F6",
    bgTint: "rgba(59, 130, 246, 0.12)",
  },
};

// ─── Toast Provider ──────────────────────────────────────────────────────────

interface Props {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<Props> = ({ children }) => {
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    translateY.value = withTiming(-120, {
      duration: 300,
      easing: Easing.bezier(0.4, 0, 1, 1),
    });
    opacity.value = withTiming(0, { duration: 250 });
    scale.value = withTiming(0.95, { duration: 250 });

    setTimeout(() => {
      setToast(null);
    }, 300);
  }, [translateY, opacity, scale]);

  const showToast = useCallback(
    (payload: ToastPayload) => {
      clearTimer();
      setToast(payload);

      translateY.value = -120;
      opacity.value = 0;
      scale.value = 0.95;

      requestAnimationFrame(() => {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
          mass: 0.8,
        });
        opacity.value = withTiming(1, { duration: 300 });
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 200,
        });
      });

      timerRef.current = setTimeout(() => {
        hideToast();
      }, TOAST_DURATION);
    },
    [clearTimer, hideToast, translateY, opacity, scale],
  );

  useEffect(() => {
    const unsubscribe = toastEmitter.on(showToast);
    return () => {
      unsubscribe();
      clearTimer();
    };
  }, [showToast, clearTimer]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const variant = toast ? variantConfig[toast.type] : variantConfig.info;

  return (
    <>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            animatedStyle,
            {
              top: insets.top + 8,
            },
          ]}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.toast,
              {
                backgroundColor: colors.isDark
                  ? "rgba(30, 41, 59, 0.97)"
                  : "rgba(255, 255, 255, 0.97)",
                borderColor: variant.color + "40",
                shadowColor: variant.color,
              },
            ]}
          >
            {/* Accent bar on the left */}
            <View
              style={[styles.accentBar, { backgroundColor: variant.color }]}
            />

            {/* Icon with tinted background */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: variant.bgTint },
              ]}
            >
              <Ionicons name={variant.icon} size={22} color={variant.color} />
            </View>

            {/* Message text */}
            <Text
              style={[
                styles.message,
                {
                  color: colors.isDark ? "#F1F5F9" : "#0F172A",
                },
              ]}
              numberOfLines={2}
            >
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    width: SCREEN_WIDTH - 32,
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingLeft: 0,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      },
    }),
  },
  accentBar: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    marginRight: 12,
    marginLeft: 0,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
});
