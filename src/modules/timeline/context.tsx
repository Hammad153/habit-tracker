import React, { createContext, ReactNode, useContext, useState } from "react";
import { ToastService } from "@/src/services";
import { useAuthState } from "@/src/modules/auth/context";
import { ICompletion } from "@/src/modules/habits/model";
import { TimelineService } from "./api";

interface IProps {
  children: ReactNode;
}

type TTimelineContext = {
  loading: boolean;
  timeline: ICompletion[];
  fetchTimeline: () => Promise<void>;
};

export const TimelineContext = createContext<TTimelineContext | undefined>(
  undefined,
);

export const useTimelineState = () => {
  const context = useContext(TimelineContext);
  if (context === undefined) {
    throw new Error(
      "useTimelineState must be used within the TimelineProvider",
    );
  }
  return context;
};

export const TimelineProvider: React.FC<IProps> = ({ children }) => {
  const { user } = useAuthState();
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState<ICompletion[]>([]);

  const fetchTimeline = () => {
    setLoading(true);
    return TimelineService.get(user!.id)
      .then((data) => {
        if (data) {
          setTimeline(data);
        }
      })
      .catch((err) => {
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <TimelineContext.Provider
      value={{
        loading,
        timeline,
        fetchTimeline,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
};
