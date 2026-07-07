import React, { createContext, ReactNode, useContext, useState } from "react";
import { ToastService } from "@/src/services";
import { DailyPlanService } from "./api";
import { IDailyPlan, IDailyPlanSummary, IDailyPlanTask } from "./model";

interface IProps {
  children: ReactNode;
}

type DailyPlanContextType = {
  loading: boolean;
  error: boolean;
  plans: IDailyPlan[];
  selectedPlan: IDailyPlan | null;
  summary: IDailyPlanSummary | null;
  fetchPlans: (params?: { date?: string; startDate?: string; endDate?: string }) => Promise<void>;
  fetchSummary: (date?: string) => Promise<void>;
  createPlan: (data: Partial<IDailyPlan>) => Promise<IDailyPlan | void>;
  updatePlan: (id: string, data: Partial<IDailyPlan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  createTask: (data: Partial<IDailyPlanTask>) => Promise<void>;
  updateTask: (id: string, data: Partial<IDailyPlanTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (taskIds: string[]) => Promise<void>;
};

const DailyPlanContext = createContext<DailyPlanContextType | undefined>(undefined);

export const useDailyPlanState = () => {
  const context = useContext(DailyPlanContext);
  if (!context) throw new Error("useDailyPlanState must be used within DailyPlanProvider");
  return context;
};

export const DailyPlanProvider: React.FC<IProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [plans, setPlans] = useState<IDailyPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<IDailyPlan | null>(null);
  const [summary, setSummary] = useState<IDailyPlanSummary | null>(null);

  const run = async <T,>(work: () => Promise<T>, success?: string) => {
    setLoading(true);
    setError(false);
    try {
      const result = await work();
      if (success) ToastService.Success(success);
      return result;
    } catch (err) {
      setError(true);
      ToastService.ApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = (params: { date?: string; startDate?: string; endDate?: string } = {}) =>
    run(async () => {
      const data = await DailyPlanService.plans(params);
      setPlans(data);
      setSelectedPlan(data[0] ?? null);
    });

  const fetchSummary = (date?: string) =>
    run(async () => setSummary(await DailyPlanService.summary(date)));

  const refreshDate = async (date?: string) => {
    const [nextPlans, nextSummary] = await Promise.all([
      DailyPlanService.plans({ date }),
      DailyPlanService.summary(date),
    ]);
    setPlans(nextPlans);
    setSelectedPlan(nextPlans[0] ?? null);
    setSummary(nextSummary);
  };

  return (
    <DailyPlanContext.Provider
      value={{
        loading,
        error,
        plans,
        selectedPlan,
        summary,
        fetchPlans,
        fetchSummary,
        createPlan: (data) =>
          run(async () => {
            const plan = await DailyPlanService.createPlan(data);
            await refreshDate(data.planDate);
            return plan;
          }, "Plan saved"),
        updatePlan: (id, data) =>
          run(async () => {
            await DailyPlanService.updatePlan(id, data);
            await refreshDate(data.planDate ?? selectedPlan?.planDate);
          }, "Plan updated"),
        deletePlan: (id) =>
          run(async () => {
            await DailyPlanService.deletePlan(id);
            await refreshDate(selectedPlan?.planDate);
          }, "Plan deleted"),
        createTask: (data) =>
          run(async () => {
            await DailyPlanService.createTask(data);
            await refreshDate(selectedPlan?.planDate);
          }, "Task saved"),
        updateTask: (id, data) =>
          run(async () => {
            await DailyPlanService.updateTask(id, data);
            await refreshDate(selectedPlan?.planDate);
          }, "Task updated"),
        deleteTask: (id) =>
          run(async () => {
            await DailyPlanService.deleteTask(id);
            await refreshDate(selectedPlan?.planDate);
          }, "Task deleted"),
        reorderTasks: (taskIds) =>
          run(async () => {
            await DailyPlanService.reorderTasks(taskIds);
            await refreshDate(selectedPlan?.planDate);
          }),
      }}
    >
      {children}
    </DailyPlanContext.Provider>
  );
};
