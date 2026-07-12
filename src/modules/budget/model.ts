import { IBaseModel } from "@/src/models";

export type BudgetPeriodType = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";

export interface IExpenseCategory extends IBaseModel {
  userId?: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
}

/** One week row of a WEEKLY budget. */
export interface IBudgetBreakdown extends IBaseModel {
  budgetId: string;
  label: string;
  startDate: string;
  endDate: string;
  amount: number;
  note?: string | null;
  sortOrder: number;
}

/** Optional per-category planning on MONTHLY / CUSTOM budgets. */
export interface IBudgetAllocation extends IBaseModel {
  budgetId: string;
  categoryId: string;
  amount: number;
  category?: IExpenseCategory;
}

export interface IBudgetCategoryBreakdown {
  categoryId?: string;
  category: string;
  total: number;
  color?: string;
  icon?: string;
}

export interface IBudgetDailyBreakdown {
  date: string;
  total: number;
}

export interface IBudgetWeeklyBreakdown extends IBudgetBreakdown {
  spent: number;
  remainingAmount: number;
  utilisationPercentage: number;
}

export interface IBudget extends IBaseModel {
  userId: string;
  title: string;
  amount: number;
  note?: string | null;
  periodType: BudgetPeriodType;
  startDate: string;
  endDate: string;
  expenses?: IExpense[];
  breakdowns?: IBudgetBreakdown[];
  allocations?: IBudgetAllocation[];
  plannedAmount?: number;
  budgetedExpenseTotal?: number;
  remainingAmount?: number;
  utilisationPercentage?: number;
  overspentAmount?: number;
  periodIncome?: number;
  totalPeriodExpenses?: number;
  netCashFlow?: number;
  categoryBreakdown?: IBudgetCategoryBreakdown[];
  dailyBreakdown?: IBudgetDailyBreakdown[];
  weeklyBreakdown?: IBudgetWeeklyBreakdown[];
}

/** Shape the create/update endpoints accept. */
export interface IBudgetPayload {
  title: string;
  amount: number;
  note?: string;
  periodType: BudgetPeriodType;
  startDate: string;
  endDate: string;
  breakdowns?: {
    label: string;
    startDate: string;
    endDate: string;
    amount: number;
    note?: string;
  }[];
  allocations?: { categoryId: string; amount: number }[];
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
  scope?: BudgetPeriodType | "AUTO";
  totalBudget: number;
  plannedBudget?: number;
  totalIncome: number;
  totalExpenses: number;
  budgetedExpenses?: number;
  budgetedExpenseTotal?: number;
  unbudgetedExpenses?: number;
  unbudgetedExpenseTotal?: number;
  remainingBalance: number;
  netCashFlow?: number;
  remainingBudget: number;
  overspentAmount?: number;
  budgetUsagePercentage: number;
  warning?: string | null;
  budgets: IBudget[];
  allBudgets?: IBudget[];
  categoryBreakdown: {
    categoryId?: string;
    category: string;
    total: number;
    color?: string;
    icon?: string;
  }[];
  recentExpenses: IExpense[];
  recentIncome: IIncome[];
}
