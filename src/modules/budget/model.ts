import { IBaseModel } from "@/src/models";

export type BudgetPeriodType = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";

export interface IExpenseCategory extends IBaseModel {
  userId?: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
}

export interface IBudget extends IBaseModel {
  userId: string;
  title: string;
  amount: number;
  periodType: BudgetPeriodType;
  startDate: string;
  endDate: string;
  expenses?: IExpense[];
}

export interface IExpense extends IBaseModel {
  userId: string;
  budgetId?: string;
  categoryId: string;
  title: string;
  amount: number;
  note?: string;
  expenseDate: string;
  category?: IExpenseCategory;
  budget?: IBudget;
}

export interface IIncome extends IBaseModel {
  userId: string;
  title: string;
  amount: number;
  incomeDate: string;
  note?: string;
}

export interface IBudgetSummary {
  startDate: string;
  endDate: string;
  totalBudget: number;
  totalIncome: number;
  totalExpenses: number;
  remainingBalance: number;
  remainingBudget: number;
  budgetUsagePercentage: number;
  warning?: string | null;
  budgets: IBudget[];
  categoryBreakdown: {
    category: string;
    total: number;
    color?: string;
    icon?: string;
  }[];
  recentExpenses: IExpense[];
  recentIncome: IIncome[];
}
