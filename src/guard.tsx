import React, { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { ApLoader } from "@/src/components";
import { useAuthState } from "@/src/modules/auth/context";

interface IProps {
  children: React.ReactNode;
}

const ApRouteAuthGuard: React.FC<IProps> = ({ children }) => {
  const { user, isLoading } = useAuthState();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "signup";

    if (!user && !inAuthGroup) {
      router.replace("/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, segments, isLoading]);

  if (isLoading) {
    return <ApLoader />;
  }

  return <>{children}</>;
};

export default ApRouteAuthGuard;
