import React, { FC } from "react";
import { SettingsProvider } from "@/src/modules/settings/context";
import { AuthProvider } from "@/src/modules/auth/context";
import { ProfileProvider } from "@/src/modules/profile/context";
import { HabitProvider } from "@/src/modules/habits/context";
import { AwardsProvider } from "@/src/modules/awards/context";
import { TimelineProvider } from "@/src/modules/timeline/context";
import { SubscriptionProvider } from "@/src/modules/subscription/context";
import { JournalProvider } from "@/src/modules/journal/context";
import { NotificationsProvider } from "@/src/modules/notifications/context";

type ContextProvider = FC<{ children: React.ReactNode }>;

export const combineContext = (
  ...components: ContextProvider[]
): ContextProvider => {
  return components.reduce<ContextProvider>(
    (AccumulatedComponents, CurrentComponent) => {
      const CombinedComponent: ContextProvider = ({ children }) => {
        return (
          <AccumulatedComponents>
            <CurrentComponent>{children}</CurrentComponent>
          </AccumulatedComponents>
        );
      };
      return CombinedComponent;
    },
    ({ children }) => <>{children}</>,
  );
};

const providers: ContextProvider[] = [
  SettingsProvider,
  AuthProvider,
  ProfileProvider,
  SubscriptionProvider,
  HabitProvider,
  JournalProvider,
  NotificationsProvider,
  AwardsProvider,
  TimelineProvider,
];

export const AppContextProvider = combineContext(...providers);
