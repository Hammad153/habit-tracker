import React, { ReactNode, useEffect } from "react";
import { AppState } from "react-native";
import axiosInstance from "@/src/libs/axios";
import { flushOfflineMutations } from "./offline";

interface IProps {
  children: ReactNode;
}

export const OfflineSyncProvider: React.FC<IProps> = ({ children }) => {
  useEffect(() => {
    void flushOfflineMutations(axiosInstance);

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void flushOfflineMutations(axiosInstance);
      }
    });

    return () => subscription.remove();
  }, []);

  return <>{children}</>;
};
