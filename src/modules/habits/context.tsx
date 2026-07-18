import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import {
  isOfflineQueuedPayload,
  ToastService,
  NotificationService,
} from "@/src/services";
import { useAuthState } from "@/src/modules/auth/context";
import { useSubscriptionState } from "@/src/modules/subscription/context";
import { isSameDateKey } from "@/src/utils/date";
import { IHabit } from "./model";
import { HabitService } from "./api";

interface IProps {
  children: ReactNode;
}

type THabitContext = {
  loading: boolean;
  error: boolean;
  habits: IHabit[];
  habit: IHabit;
  setHabit: React.Dispatch<SetStateAction<IHabit>>;
  fetchHabits: (options?: { silent?: boolean }) => Promise<void>;
  fetchOneHabit: (id: string) => Promise<void>;
  createHabit: (data: Partial<IHabit>) => Promise<IHabit | void>;
  updateHabit: (id: string, data: Partial<IHabit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabit: (id: string, date: string, value?: number) => Promise<void>;
};

export const HabitContext = createContext<THabitContext | undefined>(undefined);

export const useHabitState = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error("useHabitState must be used within the HabitProvider");
  }
  return context;
};

export const HabitProvider: React.FC<IProps> = ({ children }) => {
  const { user } = useAuthState();
  const { setShowUpgradeModal, fetchSubscription } = useSubscriptionState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [habits, setHabits] = useState<IHabit[]>([]);
  const [habit, setHabit] = useState<IHabit>({} as IHabit);

  const getOptimisticCompletions = (
    currentHabit: IHabit,
    id: string,
    date: string,
    value?: number,
  ) => {
    if (currentHabit.id !== id) return currentHabit.completions;

    const completions = currentHabit.completions ?? [];
    const existing = completions.find((completion) =>
      isSameDateKey(completion.date, date),
    );

    if (value === undefined) {
      if (existing) {
        return completions.filter(
          (completion) => !isSameDateKey(completion.date, date),
        );
      }

      return [
        ...completions,
        {
          id: `optimistic-${id}-${date}`,
          habitId: id,
          date,
          status: true,
          value: currentHabit.goal,
        },
      ];
    }

    const status = value >= currentHabit.goal;
    const nextCompletion = {
      id: existing?.id ?? `optimistic-${id}-${date}`,
      habitId: id,
      date,
      status,
      value,
    };

    if (existing) {
      return completions.map((completion) =>
        isSameDateKey(completion.date, date) ? nextCompletion : completion,
      );
    }

    return [...completions, nextCompletion];
  };

  const applyOptimisticToggle = (id: string, date: string, value?: number) => {
    setHabits((currentHabits) =>
      currentHabits.map((currentHabit) =>
        currentHabit.id === id
          ? {
              ...currentHabit,
              completions: getOptimisticCompletions(
                currentHabit,
                id,
                date,
                value,
              ),
            }
          : currentHabit,
      ),
    );

    setHabit((currentHabit) =>
      currentHabit?.id === id
        ? {
            ...currentHabit,
            completions: getOptimisticCompletions(
              currentHabit,
              id,
              date,
              value,
            ),
          }
        : currentHabit,
    );
  };

  const fetchHabits = (options?: { silent?: boolean }) => {
    if (!user?.id) return Promise.resolve();
    if (!options?.silent) {
      setLoading(true);
    }
    setError(false);
    return HabitService.getAll(user.id)
      .then((data) => {
        if (data) {
          setHabits(data);
        }
      })
      .catch((err) => {
        setError(true);
        ToastService.ApiError(err);
      })
      .finally(() => {
        if (!options?.silent) {
          setLoading(false);
        }
      });
  };

  const fetchOneHabit = (id: string) => {
    setLoading(true);
    return HabitService.getById(id)
      .then((data) => {
        if (data) {
          setHabit(data);
        }
      })
      .catch((err) => {
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const createHabit = (data: Partial<IHabit>) => {
    if (!user?.id) return Promise.resolve();
    setLoading(true);
    return HabitService.create(data, user.id)
      .then((created: IHabit) => {
        ToastService.Success("Habit created successfully");
        fetchSubscription();
        // Refresh the list, but resolve with the created habit so callers can
        // attach reminders or navigate to it.
        return fetchHabits().then(() => created);
      })
      .catch((err) => {
        const errorData = err?.response?.data;
        if (
          err?.response?.status === 403 &&
          errorData?.message?.code === "HABIT_LIMIT_REACHED"
        ) {
          fetchSubscription();
          setShowUpgradeModal(true);
        } else {
          ToastService.ApiError(err);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updateHabit = (id: string, data: Partial<IHabit>) => {
    setLoading(true);
    return HabitService.update(id, data)
      .then(() => {
        ToastService.Success("Habit updated successfully");
        return fetchHabits();
      })
      .catch((err) => {
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteHabit = (id: string) => {
    setLoading(true);
    return HabitService.delete(id)
      .then(() => {
        NotificationService.cancelHabitReminder(id);
        ToastService.Success("Habit deleted successfully");
        return fetchHabits();
      })
      .catch((err) => {
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toggleHabit = (id: string, date: string, value?: number) => {
    const previousHabits = habits;
    const previousHabit = habit;
    applyOptimisticToggle(id, date, value);

    return HabitService.toggle(id, date, value)
      .then((result) => {
        if (isOfflineQueuedPayload(result)) {
          ToastService.Success("Habit update saved offline");
          return;
        }
        return fetchHabits({ silent: true });
      })
      .catch((err) => {
        setHabits(previousHabits);
        setHabit(previousHabit);
        ToastService.ApiError(err);
      });
  };

  return (
    <HabitContext.Provider
      value={{
        loading,
        error,
        habits,
        habit,
        setHabit,
        fetchHabits,
        fetchOneHabit,
        createHabit,
        updateHabit,
        deleteHabit,
        toggleHabit,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};
