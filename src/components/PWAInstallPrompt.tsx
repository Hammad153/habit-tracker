import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  ShieldCheck,
  Bell,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Info,
} from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";
import { useFeedback } from "@/src/utils/feedback";
import { ToastService } from "@/src/services";
import { ApStorageKeys } from "@/src/services/storage";

type DeviceType = "ios" | "android" | "desktop";
type PromptView = "overview" | "guide" | "confirm_dismiss";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

export const PWAInstallPrompt: React.FC = () => {
  const colors = useTheme();
  const { triggerHaptic, triggerSuccess } = useFeedback();

  const [visible, setVisible] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<PromptView>("overview");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("ios");
  const [detectedDevice, setDetectedDevice] = useState<DeviceType>("desktop");
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Check if app is already running as standalone or marked as installed
  const checkIsInstalled = useCallback((): boolean => {
    if (typeof window === "undefined") return false;

    // Standalone display mode check
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) return true;

    // Storage persistence check
    try {
      if (localStorage.getItem(ApStorageKeys.PwaInstalled) === "true") {
        return true;
      }
    } catch {
      // Ignore storage access errors
    }

    return false;
  }, []);

  // Check if prompt is in 48-hour cooldown
  const checkIsDismissed = useCallback((): boolean => {
    if (typeof window === "undefined") return false;

    try {
      // Check 48-hour snooze timestamp
      const dismissedUntilStr = localStorage.getItem(ApStorageKeys.PwaDismissedUntil);
      if (dismissedUntilStr) {
        const dismissedUntil = parseInt(dismissedUntilStr, 10);
        if (!isNaN(dismissedUntil) && Date.now() < dismissedUntil) {
          return true;
        }
      }

      // Check current session dismissal
      if (sessionStorage.getItem("pwa_prompt_dismissed") === "true") {
        return true;
      }
    } catch {
      // Ignore storage access errors
    }

    return false;
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    // 1. Never show if already installed
    if (checkIsInstalled()) {
      return;
    }

    // 2. Do not show if within 48-hour cooldown or dismissed this session
    if (checkIsDismissed()) {
      return;
    }

    // Check early-captured beforeinstallprompt event from window
    if (typeof window !== "undefined" && (window as any).__deferredInstallPrompt) {
      setDeferredPrompt((window as any).__deferredInstallPrompt);
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
      if (typeof window !== "undefined") {
        (window as any).__deferredInstallPrompt = e;
      }
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for app installed event (User completed installation)
    const handleAppInstalled = () => {
      try {
        localStorage.setItem(ApStorageKeys.PwaInstalled, "true");
      } catch {}
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Show prompt after a slight delay to allow page initialization
    const timer = setTimeout(() => {
      setVisible(true);
    }, 600);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(timer);
    };
  }, [checkIsInstalled, checkIsDismissed]);

  // Scroll to top whenever view changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentView]);

  // Handle 1-tap direct install via browser prompt API
  const handleDirectInstall = useCallback(async () => {
    triggerHaptic();
    setIsInstalling(true);

    const activePrompt =
      deferredPrompt ||
      (typeof window !== "undefined" ? (window as any).__deferredInstallPrompt : null);

    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice && choice.outcome === "accepted") {
          triggerSuccess();
          ToastService.Success("Embermate installed successfully!");
          try {
            localStorage.setItem(ApStorageKeys.PwaInstalled, "true");
          } catch {}
          setVisible(false);
        }
        setDeferredPrompt(null);
        if (typeof window !== "undefined") {
          (window as any).__deferredInstallPrompt = null;
        }
        setIsInstalling(false);
        return;
      } catch (err) {
        console.log("Install prompt error:", err);
      }
    }

    setIsInstalling(false);
    // If programmatic prompt is not supported, navigate smoothly to guided setup
    setCurrentView("guide");
  }, [deferredPrompt, triggerHaptic, triggerSuccess]);

  // User clicked "I've Added It!" in guide
  const handleMarkInstalled = useCallback(() => {
    triggerSuccess();
    try {
      localStorage.setItem(ApStorageKeys.PwaInstalled, "true");
    } catch {}
    ToastService.Success("Welcome to Embermate! App installed.");
    setVisible(false);
  }, [triggerSuccess]);

  // Initial dismiss intent: open confirmation view with glimpse of missed perks
  const handleInitiateDismiss = useCallback(() => {
    triggerHaptic();
    setCurrentView("confirm_dismiss");
  }, [triggerHaptic]);

  // User definitively decides to continue without installing -> snooze for 48 hours
  const handleConfirmDismissWithCooldown = useCallback(() => {
    triggerHaptic();
    try {
      const snoozeUntil = Date.now() + FORTY_EIGHT_HOURS_MS;
      localStorage.setItem(ApStorageKeys.PwaDismissedUntil, String(snoozeUntil));
      sessionStorage.setItem("pwa_prompt_dismissed", "true");
    } catch {
      // Fallback in case of storage quota or private browsing restrictions
    }
    setVisible(false);
    ToastService.Success("We'll remind you in 2 days. Enjoy Embermate!");
  }, [triggerHaptic]);

  // Guide steps per device
  const guideSteps = useMemo(() => {
    if (selectedDevice === "ios") {
      return [
        {
          step: 1,
          title: "Tap the Share Icon",
          desc: "In Safari, tap the Share button (the square with an arrow pointing up) on the bottom navigation bar.",
          icon: Share,
        },
        {
          step: 2,
          title: "Select 'Add to Home Screen'",
          desc: "Scroll down the share sheet menu and tap 'Add to Home Screen' with the plus (+) icon.",
          icon: PlusSquare,
        },
        {
          step: 3,
          title: "Tap 'Add' to Confirm",
          desc: "Tap 'Add' in the top-right corner. Embermate will instantly appear on your home screen!",
          icon: CheckCircle2,
        },
      ];
    }

    if (selectedDevice === "android") {
      return [
        {
          step: 1,
          title: "Open Browser Menu",
          desc: "Tap the three dots (⋮) in the top-right corner of Google Chrome or Samsung Internet.",
          icon: MoreVertical,
        },
        {
          step: 2,
          title: "Select 'Install app'",
          desc: "Tap 'Install app' (or 'Add to Home screen') from the dropdown options.",
          icon: Download,
        },
        {
          step: 3,
          title: "Confirm & Install",
          desc: "Tap 'Install' in the prompt. Embermate will be added to your app drawer and home screen.",
          icon: CheckCircle2,
        },
      ];
    }

    return [
      {
        step: 1,
        title: "Look at the Address Bar",
        desc: "Click the Install Embermate icon (computer with down arrow) on the right side of the browser URL bar.",
        icon: Monitor,
      },
      {
        step: 2,
        title: "Or Use the Browser Menu",
        desc: "Click the three dots (⋮) in top right → 'Save and share' → 'Install Embermate'.",
        icon: Download,
      },
      {
        step: 3,
        title: "Launch in Dedicated Window",
        desc: "Click 'Install' in the confirmation prompt to run Embermate in its own clean desktop window.",
        icon: CheckCircle2,
      },
    ];
  }, [selectedDevice]);

  // Glimpse of missed features for the confirmation view
  const missedPerks = useMemo(
    () => [
      {
        title: "Offline Habit Tracking",
        desc: "Log daily completions and preserve your streaks anywhere, even without cellular data or WiFi.",
        icon: ShieldCheck,
      },
      {
        title: "Clutter-Free Full Screen",
        desc: "Eliminate browser address bars, navigation tabs, and popups for pure daily habit focus.",
        icon: Maximize2,
      },
      {
        title: "Instant Home Screen Launch",
        desc: "Opens with zero loading latency directly from your dock, exactly like a native app.",
        icon: Zap,
      },
      {
        title: "Timely Habit Reminders",
        desc: "Stay consistent throughout the day with reliable notification alerts and badges.",
        icon: Bell,
      },
    ],
    []
  );

  // Label for the guide action button on the overview screen
  const guideButtonLabel = useMemo(() => {
    switch (selectedDevice) {
      case "ios":
        return "See iPhone Setup Walkthrough";
      case "android":
        return "See Android Setup Walkthrough";
      default:
        return "See Desktop Setup Walkthrough";
    }
  }, [selectedDevice]);

  if (Platform.OS !== "web" || !visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleInitiateDismiss}
    >
      <View className="flex-1 justify-end sm:justify-center sm:items-center">
        {/* Dimmed Backdrop */}
        <Pressable
          className="absolute inset-0"
          style={{ backgroundColor: colors.overlay }}
          onPress={handleInitiateDismiss}
        />

        {/* Modal Container */}
        <View
          className="w-full sm:max-w-[430px] rounded-t-3xl sm:rounded-3xl px-5 pt-3 pb-6 flex-col max-h-[92%]"
          style={{
            backgroundColor: colors.backgroundElevated,
            shadowColor: colors.inkPrimary,
            shadowOpacity: 0.2,
            shadowRadius: 30,
            shadowOffset: { width: 0, height: -10 },
            elevation: 12,
          }}
        >
          {/* Top Bar: Handle & Actions */}
          <View className="flex-row items-center justify-between mb-3 pt-1">
            {currentView !== "overview" ? (
              <Pressable
                onPress={() => {
                  triggerHaptic();
                  setCurrentView("overview");
                }}
                hitSlop={8}
                className="flex-row items-center py-1 px-2 rounded-full active:opacity-70"
                style={{ backgroundColor: colors.backgroundSurface }}
              >
                <ArrowLeft size={14} color={colors.inkPrimary} strokeWidth={2.5} />
                <Text
                  className="text-[12px] font-semibold ml-1.5"
                  style={{ color: colors.inkPrimary }}
                >
                  Back
                </Text>
              </Pressable>
            ) : (
              <View className="w-16" />
            )}

            {/* Subtle sheet drag indicator */}
            <View
              className="w-10 h-1 rounded-full self-center"
              style={{ backgroundColor: colors.borderStrong }}
            />

            {/* Close Button */}
            <Pressable
              onPress={handleInitiateDismiss}
              hitSlop={8}
              className="w-7 h-7 rounded-full items-center justify-center active:opacity-70"
              style={{ backgroundColor: colors.backgroundSurface }}
            >
              <X size={15} color={colors.inkSecondary} strokeWidth={2.2} />
            </Pressable>
          </View>

          {/* Scrollable Content Body */}
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {/* VIEW 1: OVERVIEW SCREEN */}
            {currentView === "overview" && (
              <View className="flex-col">
                {/* Branded Icon Header */}
                <View className="items-center justify-center mb-3">
                  <View
                    className="w-16 h-16 rounded-2xl items-center justify-center relative border"
                    style={{
                      backgroundColor: colors.accentSoft,
                      borderColor: colors.surfaceBorder,
                      shadowColor: colors.accent,
                      shadowOpacity: 0.25,
                      shadowRadius: 14,
                      shadowOffset: { width: 0, height: 4 },
                    }}
                  >
                    <Flame size={32} color={colors.accent} strokeWidth={2.2} />
                    <View
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center border"
                      style={{
                        backgroundColor: colors.backgroundElevated,
                        borderColor: colors.surfaceBorder,
                      }}
                    >
                      <Sparkles size={13} color={colors.accent} strokeWidth={2.5} />
                    </View>
                  </View>
                </View>

                {/* Badge & Headings */}
                <View className="items-center mb-4">
                  <View
                    className="px-2.5 py-0.5 rounded-full mb-2 flex-row items-center border"
                    style={{
                      backgroundColor: colors.accentSoft,
                      borderColor: colors.accent,
                    }}
                  >
                    <Zap size={11} color={colors.accent} strokeWidth={2.5} />
                    <Text
                      className="text-[10px] font-bold uppercase tracking-wider ml-1"
                      style={{ color: colors.accent }}
                    >
                      Instant App · PWA
                    </Text>
                  </View>

                  <Text
                    className="text-[21px] font-bold text-center tracking-tight mb-1"
                    style={{ color: colors.inkPrimary }}
                  >
                    Install Embermate
                  </Text>
                  <Text
                    className="text-[13px] leading-[19px] text-center px-3"
                    style={{ color: colors.inkSecondary }}
                  >
                    Add Embermate to your device for an instant, distraction-free habit tracking experience.
                  </Text>
                </View>

                {/* 3 Modern Feature Badges */}
                <View className="flex-row items-center justify-center gap-2 mb-4">
                  <View
                    className="flex-row items-center px-2.5 py-1.5 rounded-xl border flex-1 justify-center"
                    style={{
                      backgroundColor: colors.backgroundSurface,
                      borderColor: colors.border,
                    }}
                  >
                    <Maximize2 size={12} color={colors.accent} strokeWidth={2.2} />
                    <Text
                      className="text-[11px] font-medium ml-1.5"
                      style={{ color: colors.inkPrimary }}
                    >
                      Full Screen
                    </Text>
                  </View>

                  <View
                    className="flex-row items-center px-2.5 py-1.5 rounded-xl border flex-1 justify-center"
                    style={{
                      backgroundColor: colors.backgroundSurface,
                      borderColor: colors.border,
                    }}
                  >
                    <ShieldCheck size={12} color={colors.accent} strokeWidth={2.2} />
                    <Text
                      className="text-[11px] font-medium ml-1.5"
                      style={{ color: colors.inkPrimary }}
                    >
                      Offline Ready
                    </Text>
                  </View>

                  <View
                    className="flex-row items-center px-2.5 py-1.5 rounded-xl border flex-1 justify-center"
                    style={{
                      backgroundColor: colors.backgroundSurface,
                      borderColor: colors.border,
                    }}
                  >
                    <HardDrive size={12} color={colors.accent} strokeWidth={2.2} />
                    <Text
                      className="text-[11px] font-medium ml-1.5"
                      style={{ color: colors.inkPrimary }}
                    >
                      0 MB Storage
                    </Text>
                  </View>
                </View>

                {/* 1-Tap Direct Install (if supported by current browser) */}
                {deferredPrompt && (
                  <Pressable
                    onPress={handleDirectInstall}
                    disabled={isInstalling}
                    className="w-full h-12 rounded-2xl flex-row items-center justify-center mb-4 active:opacity-90 active:scale-[0.99]"
                    style={{
                      backgroundColor: colors.accent,
                      shadowColor: colors.accent,
                      shadowOpacity: 0.3,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 4,
                    }}
                  >
                    <Zap size={17} color={colors.white} strokeWidth={2.5} />
                    <Text
                      className="text-[14px] font-bold ml-2"
                      style={{ color: colors.white }}
                    >
                      {isInstalling ? "Installing..." : "1-Tap Quick Install"}
                    </Text>
                  </Pressable>
                )}

                {/* Device Selector Section */}
                <View className="mb-3">
                  <Text
                    className="text-[11px] font-semibold uppercase tracking-wider mb-2 ml-1"
                    style={{ color: colors.inkTertiary }}
                  >
                    Select Your Device:
                  </Text>

                  <View className="flex-row gap-2">
                    {/* iPhone / Safari */}
                    <Pressable
                      onPress={() => {
                        triggerHaptic();
                        setSelectedDevice("ios");
                      }}
                      className="flex-1 p-2.5 rounded-2xl border relative items-center justify-center"
                      style={{
                        borderColor:
                          selectedDevice === "ios" ? colors.accent : colors.border,
                        backgroundColor:
                          selectedDevice === "ios"
                            ? colors.backgroundSurface
                            : colors.backgroundElevated,
                        borderWidth: selectedDevice === "ios" ? 2 : 1,
                      }}
                    >
                      {detectedDevice === "ios" && (
                        <View
                          className="absolute -top-2 right-1.5 px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: colors.accent }}
                        >
                          <Text
                            className="text-[8px] font-bold uppercase"
                            style={{ color: colors.white }}
                          >
                            Detected
                          </Text>
                        </View>
                      )}
                      <Smartphone
                        size={20}
                        color={
                          selectedDevice === "ios"
                            ? colors.accent
                            : colors.inkSecondary
                        }
                        strokeWidth={2.2}
                      />
                      <Text
                        className="text-[12px] font-bold mt-1"
                        style={{ color: colors.inkPrimary }}
                      >
                        iPhone
                      </Text>
                      <Text
                        className="text-[10px]"
                        style={{ color: colors.inkTertiary }}
                      >
                        Safari / iOS
                      </Text>
                    </Pressable>

                    {/* Android / Chrome */}
                    <Pressable
                      onPress={() => {
                        triggerHaptic();
                        setSelectedDevice("android");
                      }}
                      className="flex-1 p-2.5 rounded-2xl border relative items-center justify-center"
                      style={{
                        borderColor:
                          selectedDevice === "android" ? colors.accent : colors.border,
                        backgroundColor:
                          selectedDevice === "android"
                            ? colors.backgroundSurface
                            : colors.backgroundElevated,
                        borderWidth: selectedDevice === "android" ? 2 : 1,
                      }}
                    >
                      {detectedDevice === "android" && (
                        <View
                          className="absolute -top-2 right-1.5 px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: colors.accent }}
                        >
                          <Text
                            className="text-[8px] font-bold uppercase"
                            style={{ color: colors.white }}
                          >
                            Detected
                          </Text>
                        </View>
                      )}
                      <Smartphone
                        size={20}
                        color={
                          selectedDevice === "android"
                            ? colors.accent
                            : colors.inkSecondary
                        }
                        strokeWidth={2.2}
                      />
                      <Text
                        className="text-[12px] font-bold mt-1"
                        style={{ color: colors.inkPrimary }}
                      >
                        Android
                      </Text>
                      <Text
                        className="text-[10px]"
                        style={{ color: colors.inkTertiary }}
                      >
                        Chrome / Samsung
                      </Text>
                    </Pressable>

                    {/* Desktop / PC & Mac */}
                    <Pressable
                      onPress={() => {
                        triggerHaptic();
                        setSelectedDevice("desktop");
                      }}
                      className="flex-1 p-2.5 rounded-2xl border relative items-center justify-center"
                      style={{
                        borderColor:
                          selectedDevice === "desktop" ? colors.accent : colors.border,
                        backgroundColor:
                          selectedDevice === "desktop"
                            ? colors.backgroundSurface
                            : colors.backgroundElevated,
                        borderWidth: selectedDevice === "desktop" ? 2 : 1,
                      }}
                    >
                      {detectedDevice === "desktop" && (
                        <View
                          className="absolute -top-2 right-1.5 px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: colors.accent }}
                        >
                          <Text
                            className="text-[8px] font-bold uppercase"
                            style={{ color: colors.white }}
                          >
                            Detected
                          </Text>
                        </View>
                      )}
                      <Monitor
                        size={20}
                        color={
                          selectedDevice === "desktop"
                            ? colors.accent
                            : colors.inkSecondary
                        }
                        strokeWidth={2.2}
                      />
                      <Text
                        className="text-[12px] font-bold mt-1"
                        style={{ color: colors.inkPrimary }}
                      >
                        PC / Mac
                      </Text>
                      <Text
                        className="text-[10px]"
                        style={{ color: colors.inkTertiary }}
                      >
                        Chrome / Edge
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Primary Action Under Devices: View Step-by-Step Setup Guide */}
                <Pressable
                  onPress={() => {
                    triggerHaptic();
                    setCurrentView("guide");
                  }}
                  className="w-full h-12 rounded-2xl flex-row items-center justify-between px-4 mb-3 active:opacity-90 active:scale-[0.99] border"
                  style={{
                    backgroundColor: colors.backgroundSurface,
                    borderColor: colors.borderStrong,
                  }}
                >
                  <View className="flex-row items-center flex-1 pr-2">
                    <Sparkles size={16} color={colors.accent} strokeWidth={2.2} />
                    <Text
                      className="text-[13.5px] font-bold ml-2.5"
                      style={{ color: colors.inkPrimary }}
                      numberOfLines={1}
                    >
                      {guideButtonLabel}
                    </Text>
                  </View>
                  <ChevronRight size={17} color={colors.inkSecondary} strokeWidth={2.5} />
                </Pressable>

                {/* Maybe Later Link */}
                <Pressable
                  onPress={handleInitiateDismiss}
                  className="items-center py-2 active:opacity-60"
                >
                  <Text
                    className="text-[13px] font-medium"
                    style={{ color: colors.inkTertiary }}
                  >
                    Maybe later
                  </Text>
                </Pressable>
              </View>
            )}

            {/* VIEW 2: STEP-BY-STEP GUIDE */}
            {currentView === "guide" && (
              <View className="flex-col">
                {/* Guide Title & Device Header */}
                <View className="items-center mb-4">
                  <Text
                    className="text-[11px] font-bold uppercase tracking-wider mb-1"
                    style={{ color: colors.accent }}
                  >
                    {selectedDevice === "ios"
                      ? "Apple iOS Setup"
                      : selectedDevice === "android"
                      ? "Android Setup"
                      : "Desktop Setup"}
                  </Text>
                  <Text
                    className="text-[20px] font-bold text-center tracking-tight"
                    style={{ color: colors.inkPrimary }}
                  >
                    Install on{" "}
                    {selectedDevice === "ios"
                      ? "iPhone & iPad"
                      : selectedDevice === "android"
                      ? "Android"
                      : "PC / Mac"}
                  </Text>
                  <Text
                    className="text-[12.5px] text-center mt-1 px-2"
                    style={{ color: colors.inkSecondary }}
                  >
                    Follow these 3 simple steps to add Embermate to your screen:
                  </Text>
                </View>

                {/* Optional 1-Tap Direct Install pill in guide if available */}
                {deferredPrompt && (
                  <Pressable
                    onPress={handleDirectInstall}
                    disabled={isInstalling}
                    className="w-full h-11 rounded-2xl flex-row items-center justify-center mb-3 active:opacity-90 border"
                    style={{
                      backgroundColor: colors.accentSoft,
                      borderColor: colors.accent,
                    }}
                  >
                    <Zap size={15} color={colors.accent} strokeWidth={2.5} />
                    <Text
                      className="text-[13px] font-bold ml-1.5"
                      style={{ color: colors.accent }}
                    >
                      {isInstalling ? "Installing..." : "Click for 1-Tap Instant Install"}
                    </Text>
                  </Pressable>
                )}

                {/* 3 Step Cards */}
                <View className="flex-col gap-2.5 mb-4">
                  {guideSteps.map((item) => {
                    const StepIcon = item.icon;
                    return (
                      <View
                        key={item.step}
                        className="p-3.5 rounded-2xl border flex-row items-start"
                        style={{
                          backgroundColor: colors.backgroundSurface,
                          borderColor: colors.border,
                        }}
                      >
                        {/* Number Badge */}
                        <View
                          className="w-7 h-7 rounded-xl items-center justify-center mr-3 mt-0.5"
                          style={{ backgroundColor: colors.accentSoft }}
                        >
                          <Text
                            className="text-[13px] font-black"
                            style={{ color: colors.accent }}
                          >
                            {item.step}
                          </Text>
                        </View>

                        {/* Text Information */}
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <StepIcon
                              size={14}
                              color={colors.inkPrimary}
                              strokeWidth={2.2}
                            />
                            <Text
                              className="text-[13.5px] font-bold ml-1.5"
                              style={{ color: colors.inkPrimary }}
                            >
                              {item.title}
                            </Text>
                          </View>
                          <Text
                            className="text-[12px] leading-[17px]"
                            style={{ color: colors.inkSecondary }}
                          >
                            {item.desc}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Pro Tip Box */}
                <View
                  className="p-3 rounded-2xl border mb-4 flex-row items-center"
                  style={{
                    backgroundColor: colors.backgroundSurface2,
                    borderColor: colors.surfaceBorder,
                  }}
                >
                  <Info size={15} color={colors.accent} strokeWidth={2.2} />
                  <Text
                    className="text-[11.5px] leading-[16px] ml-2 flex-1 font-medium"
                    style={{ color: colors.inkSecondary }}
                  >
                    {selectedDevice === "ios"
                      ? "Pro tip: Safari launches Embermate full-screen with no browser address bar."
                      : selectedDevice === "android"
                      ? "Pro tip: Launch from your app drawer for offline check-ins and streak alerts."
                      : "Pro tip: Pin Embermate to your desktop taskbar or dock for quick daily access."}
                  </Text>
                </View>

                {/* I've Added It Button */}
                <Pressable
                  onPress={handleMarkInstalled}
                  className="w-full h-12 rounded-2xl flex-row items-center justify-center mb-2.5 active:opacity-90 active:scale-[0.99]"
                  style={{
                    backgroundColor: colors.accent,
                    shadowColor: colors.accent,
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 4,
                  }}
                >
                  <Text
                    className="text-[14px] font-bold"
                    style={{ color: colors.white }}
                  >
                    I&apos;ve Added It! 🎉
                  </Text>
                </Pressable>

                {/* Switch Device Link */}
                <Pressable
                  onPress={() => {
                    triggerHaptic();
                    setCurrentView("overview");
                  }}
                  className="items-center py-2 active:opacity-60"
                >
                  <Text
                    className="text-[12.5px] font-medium"
                    style={{ color: colors.inkTertiary }}
                  >
                    ← Choose another device
                  </Text>
                </Pressable>
              </View>
            )}

            {/* VIEW 3: CONFIRM DISMISS SCREEN (Glimpse of Missed Perks + 48hr Snooze) */}
            {currentView === "confirm_dismiss" && (
              <View className="flex-col">
                {/* Warning / Missed Value Banner */}
                <View className="items-center justify-center mb-3">
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center border"
                    style={{
                      backgroundColor: colors.warningSoft,
                      borderColor: colors.surfaceBorder,
                    }}
                  >
                    <Flame size={28} color={colors.warning} strokeWidth={2.2} />
                  </View>
                </View>

                <View className="items-center mb-3">
                  <Text
                    className="text-[11px] font-bold uppercase tracking-wider mb-1"
                    style={{ color: colors.warning }}
                  >
                    Keep Embermate In Browser?
                  </Text>
                  <Text
                    className="text-[19px] font-bold text-center tracking-tight"
                    style={{ color: colors.inkPrimary }}
                  >
                    Wait, before you continue...
                  </Text>
                  <Text
                    className="text-[12.5px] text-center mt-1 px-3 leading-[18px]"
                    style={{ color: colors.inkSecondary }}
                  >
                    You can still use Embermate in your browser, but here is what you will miss without installing:
                  </Text>
                </View>

                {/* 4 Glimpse Feature Cards */}
                <View className="flex-col gap-2 mb-4">
                  {missedPerks.map((perk, index) => {
                    const PerkIcon = perk.icon;
                    return (
                      <View
                        key={index}
                        className="p-3 rounded-2xl border flex-row items-center"
                        style={{
                          backgroundColor: colors.backgroundSurface,
                          borderColor: colors.border,
                        }}
                      >
                        <View
                          className="w-8 h-8 rounded-xl items-center justify-center mr-3"
                          style={{ backgroundColor: colors.accentSoft }}
                        >
                          <PerkIcon size={16} color={colors.accent} strokeWidth={2.2} />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-[12.5px] font-bold mb-0.5"
                            style={{ color: colors.inkPrimary }}
                          >
                            {perk.title}
                          </Text>
                          <Text
                            className="text-[11.5px] leading-[15px]"
                            style={{ color: colors.inkSecondary }}
                          >
                            {perk.desc}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Primary: Go Back & Install */}
                <Pressable
                  onPress={() => {
                    triggerHaptic();
                    if (deferredPrompt) {
                      handleDirectInstall();
                    } else {
                      setCurrentView("guide");
                    }
                  }}
                  className="w-full h-12 rounded-2xl flex-row items-center justify-center mb-2.5 active:opacity-90 active:scale-[0.99]"
                  style={{
                    backgroundColor: colors.accent,
                    shadowColor: colors.accent,
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: 4,
                  }}
                >
                  <Sparkles size={16} color={colors.white} strokeWidth={2.2} />
                  <Text
                    className="text-[14px] font-bold ml-2"
                    style={{ color: colors.white }}
                  >
                    Install Embermate Now
                  </Text>
                </Pressable>

                {/* Secondary: Continue in browser and snooze for 48 hours */}
                <Pressable
                  onPress={handleConfirmDismissWithCooldown}
                  className="w-full h-11 rounded-2xl flex-row items-center justify-center active:opacity-75 border"
                  style={{
                    backgroundColor: colors.backgroundSurface,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    className="text-[12.5px] font-semibold"
                    style={{ color: colors.inkSecondary }}
                  >
                    Continue in Browser (Don&apos;t show for 48 hrs)
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PWAInstallPrompt;
