import React, { createContext, ReactNode, useContext, useState } from "react";
import { ToastService } from "@/src/services";
import { BudgetService } from "./api";
import {
  IBudget,
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
  fetchSummary: (startDate?: string, endDate?: string) => Promise<void>;
  fetchBudgets: (startDate?: string, endDate?: string) => Promise<void>;
  fetchExpenses: (startDate?: string, endDate?: string) => Promise<void>;
  fetchIncomes: (startDate?: string, endDate?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createBudget: (data: Partial<IBudget>) => Promise<void>;
  updateBudget: (id: string, data: Partial<IBudget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  createExpense: (data: Partial<IExpense>) => Promise<void>;
  updateExpense: (id: string, data: Partial<IExpense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  createIncome: (data: Partial<IIncome>) => Promise<void>;
  updateIncome: (id: string, data: Partial<IIncome>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
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

  const run = async (work: () => Promise<void>, success?: string) => {
    setLoading(true);
    setError(false);
    try {
      await work();
      if (success) ToastService.Success(success);
    } catch (err) {
      setError(true);
      ToastService.ApiError(err);
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

  const refreshAll = async () => {
    const [nextSummary, nextBudgets, nextExpenses, nextIncomes, nextCategories] =
      await Promise.all([
        BudgetService.summary(),
        BudgetService.budgets(),
        BudgetService.expenses(),
        BudgetService.incomes(),
        BudgetService.categories(),
      ]);
    setSummary(nextSummary);
    setBudgets(nextBudgets);
    setExpenses(nextExpenses);
    setIncomes(nextIncomes);
    setCategories(nextCategories);
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
        createBudget: (data) =>
          run(async () => {
            await BudgetService.createBudget(data);
            await refreshAll();
          }, "Budget saved"),
        updateBudget: (id, data) =>
          run(async () => {
            await BudgetService.updateBudget(id, data);
            await refreshAll();
          }, "Budget updated"),
        deleteBudget: (id) =>
          run(async () => {
            await BudgetService.deleteBudget(id);
            await refreshAll();
          }, "Budget deleted"),
        createExpense: (data) =>
          run(async () => {
            await BudgetService.createExpense(data);
            await refreshAll();
          }, "Expense saved"),
        updateExpense: (id, data) =>
          run(async () => {
            await BudgetService.updateExpense(id, data);
            await refreshAll();
          }, "Expense updated"),
        deleteExpense: (id) =>
          run(async () => {
            await BudgetService.deleteExpense(id);
            await refreshAll();
          }, "Expense deleted"),
        createIncome: (data) =>
          run(async () => {
            await BudgetService.createIncome(data);
            await refreshAll();
          }, "Income saved"),
        updateIncome: (id, data) =>
          run(async () => {
            await BudgetService.updateIncome(id, data);
            await refreshAll();
          }, "Income updated"),
        deleteIncome: (id) =>
          run(async () => {
            await BudgetService.deleteIncome(id);
            await refreshAll();
          }, "Income deleted"),
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
