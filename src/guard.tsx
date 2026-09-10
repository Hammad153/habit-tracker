import React, { useEffect, useRef } from "react";
import { BehavioralNotificationApiService } from "@/src/modules/notifications/candidates";
import { useRouter, useSegments } from "expo-router";
import { ApLoader } from "@/src/components";
import { useAuthState } from "@/src/modules/auth/context";
import { useSubscriptionState } from "@/src/modules/subscription/context";
import { NotificationService } from "@/src/services";
import { ReminderApiService } from "@/src/modules/reminders/api";

interface IProps {
  children: React.ReactNode;
}

const ApRouteAuthGuard: React.FC<IProps> = ({ children }) => {
  const { user, isLoading, authStatus } = useAuthState();
  const { subscriptionLoaded, accessGranted } = useSubscriptionState();
  const segments = useSegments();
  const router = useRouter();
  const syncedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading || authStatus === "INITIALIZING") return;

    const publicRoutes = [
      "login",
      "signup",
      "forgot-password",
      "reset-password",
    ];
    const route = segments[0] ?? "";
    const inAuthGroup = publicRoutes.includes(route);

    if (!user) {
      if (!inAuthGroup) router.replace("/login");
      return;
    }

    if (inAuthGroup) {
      router.replace("/(tabs)");
      return;
    }

    // Subscription paywall (backend-authoritative). The subscription/pricing
    // surface is intentionally exempt so an expired member can pay.
    if (
      subscriptionLoaded &&
      !accessGranted &&
      route !== "subscription"
    ) {
      router.replace("/subscription");
    }
  }, [user, segments, isLoading, authStatus, router, subscriptionLoaded, accessGranted]);

  // Re-arm local reminder notifications from the backend once per session,
  // so they survive reinstalls and new devices.
  useEffect(() => {
    if (!user?.id || syncedUserRef.current === user.id) return;
    syncedUserRef.current = user.id;

    ReminderApiService.getAll(user.id)
      .then((reminders) =>
        NotificationService.syncAllReminders(reminders || []),
      )
      .catch(() => {
        // Non-critical: reminders still fire once re-saved on this device.
        syncedUserRef.current = null;
      });

    // Phase 3.7 — behavioral insight candidates (deterministic, server-gated
    // by cadence/cooldown; local scheduling via existing notification service).
    BehavioralNotificationApiService.getCandidates()
      .then((candidates) =>
        NotificationService.scheduleBehavioralCandidates(candidates || []),
      )
      .catch(() => undefined); // best-effort by design
  }, [user?.id]);

  if (isLoading || authStatus === "INITIALIZING") {
    return <ApLoader />;
  }

  return <>{children}</>;
};

export default ApRouteAuthGuard;
