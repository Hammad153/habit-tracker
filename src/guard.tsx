import React, { useEffect, useRef } from "react";
import { useRouter, useSegments } from "expo-router";
import { ApLoader } from "@/src/components";
import { useAuthState } from "@/src/modules/auth/context";
import { NotificationService } from "@/src/services";
import { ReminderApiService } from "@/src/modules/reminders/api";

interface IProps {
  children: React.ReactNode;
}

const ApRouteAuthGuard: React.FC<IProps> = ({ children }) => {
  const { user, isLoading, authStatus } = useAuthState();
  const segments = useSegments();
  const router = useRouter();
  const syncedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading || authStatus === "INITIALIZING") return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "signup";

    if (!user && !inAuthGroup) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, segments, isLoading, authStatus, router]);

  // Re-arm local reminder notifications from the backend once per session,
  // so they survive reinstalls and new devices.
  useEffect(() => {
    if (!user?.id || syncedUserRef.current === user.id) return;
    syncedUserRef.current = user.id;

    ReminderApiService.getAll(user.id)
      .then((reminders) => NotificationService.syncAllReminders(reminders || []))
      .catch(() => {
        // Non-critical: reminders still fire once re-saved on this device.
        syncedUserRef.current = null;
      });
  }, [user?.id]);

  if (isLoading || authStatus === "INITIALIZING") {
    return <ApLoader />;
  }

  return <>{children}</>;
};

export default ApRouteAuthGuard;
