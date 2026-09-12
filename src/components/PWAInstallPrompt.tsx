import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import {
  X,
  Zap,
  Maximize2,
  HardDrive,
  Smartphone,
  Monitor,
  Share,
  PlusSquare,
  MoreVertical,
  Download,
  CheckCircle2,
  Flame,
} from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";

type DeviceType = "ios" | "android" | "desktop";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const colors = useTheme();
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("ios");
  const [detectedDevice, setDetectedDevice] = useState<DeviceType>("desktop");

  useEffect(() => {
    if (Platform.OS !== "web") return;

    // Check if running as installed standalone PWA
    const isStandalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://"));

    if (isStandalone) {
      return;
    }

    // Detect device platform from userAgent
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    let detected: DeviceType = "desktop";
    if (/iPhone|iPad|iPod/i.test(ua)) {
      detected = "ios";
    } else if (/Android/i.test(ua)) {
      detected = "android";
    }

    setDetectedDevice(detected);
    setSelectedDevice(detected);

    // Listen for beforeinstallprompt event (Android / Chromium)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Show immediately when opening the page
    const timer = setTimeout(() => {
      setVisible(true);
    }, 400);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setVisible(false);
        }
      } catch (err) {
        console.log("Install prompt error:", err);
      }
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
  }, []);

  if (Platform.OS !== "web" || !visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View className="flex-1 justify-end sm:justify-center sm:items-center">
        {/* Dimmed Backdrop */}
        <Pressable
          className="absolute inset-0"
          style={{ backgroundColor: colors.overlay }}
          onPress={handleDismiss}
        />

        {/* Install Sheet / Modal Card */}
        <View
          className="w-full sm:max-w-[440px] bg-background-elevated rounded-t-2xl sm:rounded-2xl px-5 pt-3 pb-6 flex-col max-h-[90%]"
          style={{
            shadowColor: colors.inkPrimary,
            shadowOpacity: 0.18,
            shadowRadius: 28,
            shadowOffset: { width: 0, height: -8 },
            elevation: 10,
          }}
        >
          {/* Top Drag Handle & Close Button */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="w-8" />
            <View className="w-10 h-1 rounded-pill bg-border-strong self-center" />
            <Pressable
              onPress={handleDismiss}
              hitSlop={8}
              className="w-8 h-8 rounded-pill bg-background-surface items-center justify-center active:opacity-70"
            >
              <X size={18} color={colors.inkPrimary} strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {/* Minimalist Phone Vector Graphic */}
            <View className="items-center justify-center my-3">
              <View
                className="w-20 h-28 rounded-xl border-2 items-center justify-between p-2 relative"
                style={{
                  borderColor: colors.borderStrong,
                  backgroundColor: colors.backgroundSurface,
                }}
              >
                {/* Speaker pill */}
                <View
                  className="w-6 h-1 rounded-full"
                  style={{ backgroundColor: colors.borderStrong }}
                />

                {/* Habit mini card inside phone */}
                <View
                  className="w-full rounded-md p-1.5 flex-col gap-1"
                  style={{ backgroundColor: colors.backgroundElevated }}
                >
                  <View className="flex-row items-center justify-between">
                    <View
                      className="w-3 h-3 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.accentSoft }}
                    >
                      <CheckCircle2 size={10} color={colors.accent} strokeWidth={3} />
                    </View>
                    <View className="flex-row items-center">
                      <Flame size={10} color={colors.warning} />
                      <Text
                        className="text-[8px] font-bold ml-0.5"
                        style={{ color: colors.warning }}
                      >
                        7
                      </Text>
                    </View>
                  </View>
                  <View
                    className="h-1 w-full rounded-full overflow-hidden"
                    style={{ backgroundColor: colors.backgroundSurface2 }}
                  >
                    <View
                      className="h-full w-4/5 rounded-full"
                      style={{ backgroundColor: colors.accent }}
                    />
                  </View>
                </View>

                {/* Home Indicator */}
                <View
                  className="w-8 h-1 rounded-full"
                  style={{ backgroundColor: colors.inkTertiary }}
                />

                {/* Floating Zap Badge */}
                <View
                  className="absolute -top-1 -right-2 w-7 h-7 rounded-full items-center justify-center border"
                  style={{
                    backgroundColor: colors.accentSoft,
                    borderColor: colors.backgroundElevated,
                  }}
                >
                  <Zap size={14} color={colors.accent} strokeWidth={2.5} />
                </View>
              </View>
            </View>

            {/* Header Text */}
            <Text
              className="text-[11px] font-bold tracking-widest text-center uppercase mb-1"
              style={{ color: colors.accent }}
            >
              App Experience Available
            </Text>
            <Text className="text-[20px] leading-[26px] font-bold text-center text-ink-primary mb-1.5">
              Install Habit Tracker
            </Text>
            <Text className="text-[13px] leading-[19px] text-center text-ink-secondary mb-4 px-2">
              Add Habit Tracker to your home screen for the same fast, full-screen offline experience.
            </Text>

            {/* 3 Benefit Pills matching reference design */}
            <View className="flex-row items-center justify-center gap-2 mb-4">
              <View
                className="flex-row items-center px-2.5 py-1 rounded-full"
                style={{ backgroundColor: colors.backgroundSurface2 }}
              >
                <Maximize2 size={12} color={colors.inkSecondary} strokeWidth={2} />
                <Text className="text-[11.5px] font-medium text-ink-secondary ml-1.5">
                  Full Screen
                </Text>
              </View>

              <View
                className="flex-row items-center px-2.5 py-1 rounded-full"
                style={{ backgroundColor: colors.backgroundSurface2 }}
              >
                <Zap size={12} color={colors.accent} strokeWidth={2} />
                <Text className="text-[11.5px] font-medium text-ink-secondary ml-1.5">
                  Instant Load
                </Text>
              </View>

              <View
                className="flex-row items-center px-2.5 py-1 rounded-full"
                style={{ backgroundColor: colors.backgroundSurface2 }}
              >
                <HardDrive size={12} color={colors.inkSecondary} strokeWidth={2} />
                <Text className="text-[11.5px] font-medium text-ink-secondary ml-1.5">
                  0 MB Storage
                </Text>
              </View>
            </View>

            {/* 1-Tap Install Button */}
            <Pressable
              onPress={handleInstallClick}
              className="w-full h-12 rounded-full flex-row items-center justify-center mb-4 active:opacity-90"
              style={{
                backgroundColor: colors.accent,
                shadowColor: colors.accent,
                shadowOpacity: 0.25,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
            >
              <Zap size={18} color={colors.white} strokeWidth={2.5} />
              <Text className="text-[15px] font-semibold text-white ml-2">
                1-Tap Instant Install
              </Text>
            </Pressable>

            {/* Device Selection Section */}
            <Text className="text-[10.5px] font-bold text-ink-tertiary tracking-wider uppercase mb-2.5">
              Select your device for setup instructions:
            </Text>

            <View className="flex-row gap-2 mb-3">
              {/* iPhone Tab */}
              <Pressable
                onPress={() => setSelectedDevice("ios")}
                className="flex-1 p-2.5 rounded-xl border relative items-center justify-center"
                style={{
                  borderColor:
                    selectedDevice === "ios" ? colors.inkPrimary : colors.border,
                  backgroundColor:
                    selectedDevice === "ios"
                      ? colors.backgroundSurface
                      : colors.backgroundElevated,
                  borderWidth: selectedDevice === "ios" ? 1.5 : 1,
                }}
              >
                {detectedDevice === "ios" && (
                  <View
                    className="absolute -top-2 right-1 px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: colors.inkPrimary }}
                  >
                    <Text className="text-[8.5px] font-bold text-white uppercase">
                      Detected
                    </Text>
                  </View>
                )}
                <Smartphone
                  size={18}
                  color={
                    selectedDevice === "ios"
                      ? colors.inkPrimary
                      : colors.inkSecondary
                  }
                  strokeWidth={2}
                />
                <Text className="text-[12.5px] font-semibold text-ink-primary mt-1">
                  iPhone
                </Text>
                <Text className="text-[10px] text-ink-tertiary">
                  Safari / iOS
                </Text>
              </Pressable>

              {/* Android Tab */}
              <Pressable
                onPress={() => setSelectedDevice("android")}
                className="flex-1 p-2.5 rounded-xl border relative items-center justify-center"
                style={{
                  borderColor:
                    selectedDevice === "android" ? colors.inkPrimary : colors.border,
                  backgroundColor:
                    selectedDevice === "android"
                      ? colors.backgroundSurface
                      : colors.backgroundElevated,
                  borderWidth: selectedDevice === "android" ? 1.5 : 1,
                }}
              >
                {detectedDevice === "android" && (
                  <View
                    className="absolute -top-2 right-1 px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: colors.inkPrimary }}
                  >
                    <Text className="text-[8.5px] font-bold text-white uppercase">
                      Detected
                    </Text>
                  </View>
                )}
                <Smartphone
                  size={18}
                  color={
                    selectedDevice === "android"
                      ? colors.inkPrimary
                      : colors.inkSecondary
                  }
                  strokeWidth={2}
                />
                <Text className="text-[12.5px] font-semibold text-ink-primary mt-1">
                  Android
                </Text>
                <Text className="text-[10px] text-ink-tertiary">
                  Chrome / Samsung
                </Text>
              </Pressable>

              {/* PC / Mac Tab */}
              <Pressable
                onPress={() => setSelectedDevice("desktop")}
                className="flex-1 p-2.5 rounded-xl border relative items-center justify-center"
                style={{
                  borderColor:
                    selectedDevice === "desktop" ? colors.inkPrimary : colors.border,
                  backgroundColor:
                    selectedDevice === "desktop"
                      ? colors.backgroundSurface
                      : colors.backgroundElevated,
                  borderWidth: selectedDevice === "desktop" ? 1.5 : 1,
                }}
              >
                {detectedDevice === "desktop" && (
                  <View
                    className="absolute -top-2 right-1 px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: colors.inkPrimary }}
                  >
                    <Text className="text-[8.5px] font-bold text-white uppercase">
                      Detected
                    </Text>
                  </View>
                )}
                <Monitor
                  size={18}
                  color={
                    selectedDevice === "desktop"
                      ? colors.inkPrimary
                      : colors.inkSecondary
                  }
                  strokeWidth={2}
                />
                <Text className="text-[12.5px] font-semibold text-ink-primary mt-1">
                  PC / Mac
                </Text>
                <Text className="text-[10px] text-ink-tertiary">
                  Chrome / Edge
                </Text>
              </Pressable>
            </View>

            {/* Step-by-Step Instructions */}
            <View
              className="p-3.5 rounded-xl border mb-3 flex-col gap-2.5"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.backgroundSurface,
              }}
            >
              {selectedDevice === "ios" && (
                <>
                  <View className="flex-row items-center">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-2.5"
                      style={{ backgroundColor: colors.accentSoft }}
                    >
                      <Share size={12} color={colors.accent} strokeWidth={2.5} />
                    </View>
                    <Text className="text-[12px] text-ink-primary flex-1">
                      1. In Safari, tap the <Text className="font-semibold">Share</Text> button in the bottom bar
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-2.5"
                      style={{ backgroundColor: colors.accentSoft }}
                    >
                      <PlusSquare size={12} color={colors.accent} strokeWidth={2.5} />
                    </View>
                    <Text className="text-[12px] text-ink-primary flex-1">
                      2. Scroll down and tap <Text className="font-semibold">&quot;Add to Home Screen&quot;</Text>
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-2.5"
                      style={{ backgroundColor: colors.accentSoft }}
                    >
                      <CheckCircle2 size={12} color={colors.accent} strokeWidth={2.5} />
                    </View>
                    <Text className="text-[12px] text-ink-primary flex-1">
                      3. Tap <Text className="font-semibold">&quot;Add&quot;</Text> in the top right to install
                    </Text>
                  </View>
                </>
              )}

              {selectedDevice === "android" && (
                <>
                  <View className="flex-row items-center">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-2.5"
                      style={{ backgroundColor: colors.accentSoft }}
                    >
                      <MoreVertical size={12} color={colors.accent} strokeWidth={2.5} />
                    </View>
                    <Text className="text-[12px] text-ink-primary flex-1">
                      1. In Chrome, tap the <Text className="font-semibold">three dots (⋮)</Text> in top right
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-2.5"
                      style={{ backgroundColor: colors.accentSoft }}
                    >
                      <Download size={12} color={colors.accent} strokeWidth={2.5} />
                    </View>
                    <Text className="text-[12px] text-ink-primary flex-1">
                      2. Tap <Text className="font-semibold">&quot;Install app&quot;</Text> or <Text className="font-semibold">&quot;Add to Home screen&quot;</Text>
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-2.5"
                      style={{ backgroundColor: colors.accentSoft }}
                    >
                      <CheckCircle2 size={12} color={colors.accent} strokeWidth={2.5} />
                    </View>
                    <Text className="text-[12px] text-ink-primary flex-1">
                      3. Confirm by tapping <Text className="font-semibold">&quot;Install&quot;</Text>
                    </Text>
                  </View>
                </>
              )}

              {selectedDevice === "desktop" && (
                <>
                  <View className="flex-row items-center">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-2.5"
                      style={{ backgroundColor: colors.accentSoft }}
                    >
                      <Download size={12} color={colors.accent} strokeWidth={2.5} />
                    </View>
                    <Text className="text-[12px] text-ink-primary flex-1">
                      1. Click the <Text className="font-semibold">Install icon</Text> in the right of the address bar
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-2.5"
                      style={{ backgroundColor: colors.accentSoft }}
                    >
                      <CheckCircle2 size={12} color={colors.accent} strokeWidth={2.5} />
                    </View>
                    <Text className="text-[12px] text-ink-primary flex-1">
                      2. Click <Text className="font-semibold">&quot;Install&quot;</Text> to launch in a dedicated app window
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Dismiss Link */}
            <Pressable
              onPress={handleDismiss}
              className="items-center py-2 active:opacity-60"
            >
              <Text className="text-[13px] font-medium text-ink-tertiary">
                Maybe later
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PWAInstallPrompt;
