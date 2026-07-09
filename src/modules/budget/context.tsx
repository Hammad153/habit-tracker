import React, { createContext, ReactNode, useContext, useState } from "react";
import { ToastService } from "@/src/services";
import { BudgetService } from "./api";
import {
  IBudget,
  IBudgetPayload,
  IBudgetSummary,
  IExpense,
  IExpenseCategory,
  IIncome,
} from "./model";

interface IProps {
  children: ReactNode;
}

type BudgetContextType = {
  loading: boolean;
  error: boolean;
  budgets: IBudget[];
  expenses: IExpense[];
  incomes: IIncome[];
  categories: IExpenseCategory[];
  summary: IBudgetSummary | null;
  fetchSummary: (startDate?: string, endDate?: string) => Promise<boolean>;
  fetchBudgets: (startDate?: string, endDate?: string) => Promise<boolean>;
  fetchExpenses: (startDate?: string, endDate?: string) => Promise<boolean>;
  fetchIncomes: (startDate?: string, endDate?: string) => Promise<boolean>;
  fetchCategories: () => Promise<boolean>;
  /** Fetches categories only if they have not been loaded yet. */
  ensureCategories: () => Promise<boolean>;
  createBudget: (data: IBudgetPayload) => Promise<boolean>;
  updateBudget: (id: string, data: Partial<IBudgetPayload>) => Promise<boolean>;
  deleteBudget: (id: string) => Promise<boolean>;
  createExpense: (data: Partial<IExpense>) => Promise<boolean>;
  updateExpense: (id: string, data: Partial<IExpense>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  createIncome: (data: Partial<IIncome>) => Promise<boolean>;
  updateIncome: (id: string, data: Partial<IIncome>) => Promise<boolean>;
  deleteIncome: (id: string) => Promise<boolean>;
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudgetState = () => {
  const context = useContext(BudgetContext);
  if (!context) throw new Error("useBudgetState must be used within BudgetProvider");
  return context;
};

export const BudgetProvider: React.FC<IProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [budgets, setBudgets] = useState<IBudget[]>([]);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [incomes, setIncomes] = useState<IIncome[]>([]);
  const [categories, setCategories] = useState<IExpenseCategory[]>([]);
  const [summary, setSummary] = useState<IBudgetSummary | null>(null);

  /**
   * Returns whether the work succeeded, so callers (forms) can avoid navigating
   * away after a failed save. Errors are surfaced as a toast, never rethrown.
   */
  const run = async (work: () => Promise<void>, success?: string) => {
    setLoading(true);
    setError(false);
    try {
      await work();
      if (success) ToastService.Success(success);
      return true;
    } catch (err) {
      setError(true);
      ToastService.ApiError(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = (startDate?: string, endDate?: string) =>
    run(async () => setSummary(await BudgetService.summary(startDate, endDate)));

  const fetchBudgets = (startDate?: string, endDate?: string) =>
    run(async () => setBudgets(await BudgetService.budgets(startDate, endDate)));

  const fetchExpenses = (startDate?: string, endDate?: string) =>
    run(async () => setExpenses(await BudgetService.expenses(startDate, endDate)));

  const fetchIncomes = (startDate?: string, endDate?: string) =>
    run(async () => setIncomes(await BudgetService.incomes(startDate, endDate)));

  const fetchCategories = () =>
    run(async () => setCategories(await BudgetService.categories()));

  /** Categories are effectively static; only pay for them once per session. */
  const ensureCategories = async () => {
    if (categories.length) return true;
    return fetchCategories();
  };

  /**
   * Refetch only the collections a mutation can actually invalidate, instead of
   * reloading every budget resource. Categories never change here, and a budget
   * write cannot affect income (or vice versa).
   *
   * Expenses are the exception: they roll up into both the budget they are
   * linked to and the summary, so all three are refreshed.
   */
  const refreshAfter = async (kind: "budget" | "expense" | "income") => {
    const requests: Promise<unknown>[] = [
      BudgetService.summary().then(setSummary),
    ];
    if (kind === "budget" || kind === "expense") {
      requests.push(BudgetService.budgets().then(setBudgets));
    }
    if (kind === "expense") {
      requests.push(BudgetService.expenses().then(setExpenses));
    }
    if (kind === "income") {
      requests.push(BudgetService.incomes().then(setIncomes));
    }
    await Promise.all(requests);
  };

  return (
    <BudgetContext.Provider
      value={{
        loading,
        error,
        budgets,
        expenses,
        incomes,
        categories,
        summary,
        fetchSummary,
        fetchBudgets,
        fetchExpenses,
        fetchIncomes,
        fetchCategories,
        ensureCategories,
        createBudget: (data) =>
          run(async () => {
            await BudgetService.createBudget(data);
            await refreshAfter("budget");
          }, "Budget saved"),
        updateBudget: (id, data) =>
          run(async () => {
            await BudgetService.updateBudget(id, data);
            await refreshAfter("budget");
          }, "Budget updated"),
        deleteBudget: (id) =>
          run(async () => {
            await BudgetService.deleteBudget(id);
            await refreshAfter("budget");
          }, "Budget deleted"),
        createExpense: (data) =>
          run(async () => {
            await BudgetService.createExpense(data);
            await refreshAfter("expense");
          }, "Expense saved"),
        updateExpense: (id, data) =>
          run(async () => {
            await BudgetService.updateExpense(id, data);
            await refreshAfter("expense");
          }, "Expense updated"),
        deleteExpense: (id) =>
          run(async () => {
            await BudgetService.deleteExpense(id);
            await refreshAfter("expense");
          }, "Expense deleted"),
        createIncome: (data) =>
          run(async () => {
            await BudgetService.createIncome(data);
            await refreshAfter("income");
          }, "Income saved"),
        updateIncome: (id, data) =>
          run(async () => {
            await BudgetService.updateIncome(id, data);
            await refreshAfter("income");
          }, "Income updated"),
        deleteIncome: (id) =>
          run(async () => {
            await BudgetService.deleteIncome(id);
            await refreshAfter("income");
          }, "Income deleted"),
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
