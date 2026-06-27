import React, {
  createContext,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { ToastService } from "@/src/services";
import { useAuthState } from "@/src/modules/auth/context";
import { useSubscriptionState } from "@/src/modules/subscription/context";
import { IHabit } from "./model";
import { HabitService } from "./api";

interface IProps {
  children: ReactNode;
}

type THabitContext = {
  loading: boolean;
  habits: IHabit[];
  habit: IHabit;
  setHabit: React.Dispatch<SetStateAction<IHabit>>;
  fetchHabits: () => Promise<void>;
  fetchOneHabit: (id: string) => Promise<void>;
  createHabit: (data: Partial<IHabit>) => Promise<void>;
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
  const [habits, setHabits] = useState<IHabit[]>([]);
  const [habit, setHabit] = useState<IHabit>({} as IHabit);

  const fetchHabits = () => {
    if (!user?.id) return Promise.resolve();
    setLoading(true);
    return HabitService.getAll(user.id)
      .then((data) => {
        if (data) {
          setHabits(data);
        }
      })
      .catch((err) => {
        ToastService.ApiError(err);
      })
      .finally(() => {
        setLoading(false);
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
      .then(() => {
        ToastService.Success("Habit created successfully");
        fetchSubscription();
        return fetchHabits();
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
    return HabitService.toggle(id, date, value)
      .then(() => {
        return fetchHabits();
      })
      .catch((err) => {
        ToastService.ApiError(err);
      });
  };

  return (
    <HabitContext.Provider
      value={{
        loading,
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
