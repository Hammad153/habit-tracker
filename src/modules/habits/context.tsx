import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from 'react-native';
import {
  ToastService,
  NotificationService,
} from "@/src/services";
import { useAuthState } from "@/src/modules/auth/context";
import { useSubscriptionState } from "@/src/modules/subscription/context";
import { isSameDateKey } from "@/src/utils/date";
import { CompletionKind } from "@/src/modules/identities/model";
import { IHabit, ICompletion } from "./model";
import { HabitService } from "./api";
import type { HabitBurial } from './local-state';
import { loadHabitState, newLocalId, refreshHabitSnapshots, saveComputedHabitCommand, saveHabitCommand, syncHabitCommands } from './synchronization';

interface IProps {
  children: ReactNode;
}

type THabitContext = {
  loading: boolean;
  error: boolean;
  habits: IHabit[];
  habit: IHabit;
  burials: HabitBurial[];
  pendingChanges: number;
  syncErrors: string[];
  setHabit: React.Dispatch<SetStateAction<IHabit>>;
  fetchHabits: (options?: { silent?: boolean }) => Promise<void>;
  fetchOneHabit: (id: string) => Promise<void>;
  createHabit: (data: Partial<IHabit>) => Promise<IHabit | void>;
  updateHabit: (id: string, data: Partial<IHabit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  buryHabit: (id: string, reason: string | undefined, epitaph: string) => Promise<void>;
  restoreBurial: (burialId: string) => Promise<void>;
  restartBurial: (burialId: string) => Promise<void>;
  transitionHabit: (id: string, status: NonNullable<IHabit['lifecycleStatus']>) => Promise<void>;
  toggleHabit: (
    id: string,
    date: string,
    value?: number,
    kind?: CompletionKind,
  ) => Promise<{
    coinsAwarded: number;
    newStreakMilestones?: number[];
  } | null>;
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
  const [burials, setBurials] = useState<HabitBurial[]>([]);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const activeUser = useRef(user?.id);
  activeUser.current = user?.id;

  const applyState = (userId: string, state: Awaited<ReturnType<typeof loadHabitState>>) => {
    if (activeUser.current !== userId) return;
    setHabits(state.habits);
    setBurials(state.burials);
    setPendingChanges(state.pending.length);
    setSyncErrors(Object.values(state.failures));
    setHabit((current) => state.habits.find((item) => item.id === current?.id) ?? current);
  };

  const syncNow = (userId: string) => {
    void syncHabitCommands(userId, (state) => applyState(userId, state))
      .then((state) => applyState(userId, state))
      .catch((cause) => { if (activeUser.current === userId) ToastService.ApiError(cause); });
  };

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
          kind: "FULL" as const,
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
      kind: (existing?.kind ?? "FULL") as ICompletion["kind"],
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

  useEffect(() => {
    if (!user?.id) {
      setHabits([]);
      setHabit({} as IHabit);
      setLoading(false);
      return;
    }
    setHabits([]);
    void fetchHabits();
  }, [user?.id]);

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
    const localId = newLocalId();
    const habitData: IHabit = {
      ...data,
      id: localId,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      lifecycleStatus: "ACTIVE",
      version: 0,
      completions: [],
      goal: data.goal ?? 1,
    } as IHabit;
    setLoading(true);
    return saveHabitCommand(user.id, {
      id: localId,
      type: "create",
      habit: habitData,
    })
      .then(() => syncHabitCommands(user.id))
      .then((state) => applyState(user.id, state))
      .then(() => {
        ToastService.Success("Habit created successfully");
        fetchSubscription();
        return habitData;
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
    return saveHabitCommand(user?.id ?? "", {
      id: newLocalId(),
      type: "update",
      habitId: id,
      patch: data,
    })
      .then(() => syncHabitCommands(user?.id ?? ""))
      .then((state) => applyState(user?.id ?? "", state))
      .then(() => {
        ToastService.Success("Habit updated successfully");
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
    return saveHabitCommand(user?.id ?? "", {
      id: newLocalId(),
      type: "update",
      habitId: id,
      patch: { isArchived: true, lifecycleStatus: "ARCHIVED" },
    })
      .then(() => syncHabitCommands(user?.id ?? ""))
      .then((state) => applyState(user?.id ?? "", state))
      .then(() => {
        NotificationService.cancelHabitReminder(id);
        ToastService.Success("Habit archived successfully");
      })
      .catch((err) => {
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toggleHabit = (id: string, date: string, value?: number, kind?: CompletionKind): Promise<{ coinsAwarded: number; newStreakMilestones?: number[] } | null> => {
    const previousHabits = habits;
    const previousHabit = habit;
    applyOptimisticToggle(id, date, value);

    const commandId = newLocalId();
    const currentHabit = habits.find((h) => h.id === id);
    const completionValue = value ?? currentHabit?.goal ?? 1;
    const isCompleted = value === undefined ? true : value >= (currentHabit?.goal ?? 1);
    const completionKind = kind ?? "FULL";
    const uid = user?.id ?? "";

    if (!uid) return Promise.resolve(null);

    return saveHabitCommand(uid, {
      id: commandId,
      type: "completion",
      habitId: id,
      date,
      status: isCompleted,
      value: completionValue,
      kind: completionKind,
    })
      .then(() => syncHabitCommands(uid))
      .then((state) => {
        applyState(uid, state);
        return state;
      })
      .then((state) => {
        const rewards = state.rewards[commandId];
        if (rewards) {
          ToastService.Success("+" + rewards.coinsAwarded + " coins earned!");
        } else {
          ToastService.Success("Habit logged for today!");
        }
        return rewards ?? null;
      })
      .catch((err) => {
        setHabits(previousHabits);
        setHabit(previousHabit);
        ToastService.ApiError(err);
        return null;
      });
  };

  const buryHabit = (id: string, reason: string | undefined, epitaph: string) => {
    if (!user?.id) return Promise.resolve();
    const commandId = newLocalId();
    const habit = habits.find((h) => h.id === id);
    const burial: HabitBurial = {
      id: commandId,
      habitId: id,
      userId: user.id,
      title: habit?.title ?? "",
      habitCreatedAt: habit?.createdAt ?? new Date().toISOString(),
      buriedAt: new Date().toISOString(),
      lastCompletedDay: null,
      totalCompletions: 0,
      bestStreak: 0,
      reason,
      epitaph,
      theme: "stone",
    };
    setLoading(true);
    return saveHabitCommand(user.id, {
      id: commandId,
      type: "bury",
      habitId: id,
      burial,
    })
      .then(() => syncHabitCommands(user.id))
      .then((state) => applyState(user.id, state))
      .then(() => {
        ToastService.Success("Habit buried");
        NotificationService.cancelHabitReminder(id);
      })
      .catch((err) => {
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const restoreBurial = (burialId: string) => {
    if (!user?.id) return Promise.resolve();
    setLoading(true);
    return saveHabitCommand(user.id, {
      id: newLocalId(),
      type: "restore",
      habitId: "",
      burialId,
    })
      .then(() => syncHabitCommands(user.id))
      .then((state) => applyState(user.id, state))
      .then(() => {
        ToastService.Success("Habit restored");
      })
      .catch((err) => {
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const restartBurial = (burialId: string) => {
    if (!user?.id) return Promise.resolve();
    const newHabitId = newLocalId();
    setLoading(true);
    return saveHabitCommand(user.id, {
      id: newLocalId(),
      type: "restart",
      habit: { id: newHabitId } as IHabit,
      burialId,
    })
      .then(() => syncHabitCommands(user.id))
      .then((state) => applyState(user.id, state))
      .then(() => {
        ToastService.Success("Habit restarted");
      })
      .catch((err) => {
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const transitionHabit = (id: string, status: NonNullable<IHabit['lifecycleStatus']>) => {
    if (!user?.id) return Promise.resolve();
    setLoading(true);
    return saveHabitCommand(user.id, {
      id: newLocalId(),
      type: "transition",
      habitId: id,
      status,
    })
      .then(() => syncHabitCommands(user.id))
      .then((state) => applyState(user.id, state))
      .then(() => {
        ToastService.Success("Habit status updated");
      })
      .catch((err) => {
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <HabitContext.Provider
      value={{
        loading,
        error,
        habits,
        habit,
        burials,
        pendingChanges,
        syncErrors,
        setHabit,
        fetchHabits,
        fetchOneHabit,
        createHabit,
        updateHabit,
        deleteHabit,
        toggleHabit,
        buryHabit,
        restoreBurial,
        restartBurial,
        transitionHabit,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};
