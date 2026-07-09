import { toDateKey } from "@/src/utils/date";
import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isAfter,
  startOfMonth,
} from "date-fns";
import { BudgetPeriodType, IBudget } from "./model";

export const PERIOD_TYPES: BudgetPeriodType[] = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "CUSTOM",
];

export const PERIOD_LABELS: Record<BudgetPeriodType, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  CUSTOM: "Custom",
};

export const PERIOD_HELPERS: Record<BudgetPeriodType, string> = {
  DAILY: "Set a budget for one day.",
  WEEKLY: "Plan your budget week by week.",
  MONTHLY: "Set one total budget for the selected month.",
  CUSTOM: "Set a budget for a specific date range.",
};

/** Periods that support the optional category allocation section. */
export const PERIODS_WITH_ALLOCATIONS: BudgetPeriodType[] = [
  "MONTHLY",
  "CUSTOM",
];

export interface IWeekRow {
  label: string;
  startDate: string;
  endDate: string;
  amount: string;
  note: string;
}

/**
 * `new Date("2026-07-01")` is parsed as UTC midnight, which renders as the
 * previous day west of Greenwich. Budget dates are calendar days, so build them
 * in local time instead.
 */
export const parseDateKey = (key: string) => {
  const [year, month, day] = key.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Splits a month into 7-day chunks (Week 1 = 1–7, Week 2 = 8–14, …). The final
 * week is truncated to the last day of the month, so no row ever spills over.
 */
export const buildWeeksForMonth = (month: Date) => {
  const last = endOfMonth(month);
  const rows: Pick<IWeekRow, "label" | "startDate" | "endDate">[] = [];
  let cursor = startOfMonth(month);

  while (!isAfter(cursor, last)) {
    const tentativeEnd = addDays(cursor, 6);
    const end = isAfter(tentativeEnd, last) ? last : tentativeEnd;
    rows.push({
      label: `Week ${rows.length + 1}`,
      startDate: toDateKey(cursor),
      endDate: toDateKey(end),
    });
    cursor = addDays(end, 1);
  }

  return rows;
};

/** "Jan 1 – Jan 7" */
export const formatRange = (startKey: string, endKey: string) =>
  `${format(parseDateKey(startKey), "MMM d")} – ${format(parseDateKey(endKey), "MMM d")}`;

/**
 * How a budget's date range reads on the list/detail screens. A one-day (daily)
 * budget shows a single date rather than "Jul 9 – Jul 9".
 */
export const formatBudgetRange = (startKey: string, endKey: string) => {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  if (differenceInCalendarDays(end, start) === 0) {
    return format(start, "MMM d, yyyy");
  }
  return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
};

/** Inclusive day count, so a single-day range reads as 1 day. */
export const durationInDays = (startKey: string, endKey: string) =>
  differenceInCalendarDays(parseDateKey(endKey), parseDateKey(startKey)) + 1;

export const monthBounds = (month: Date) => ({
  startDate: toDateKey(startOfMonth(month)),
  endDate: toDateKey(endOfMonth(month)),
});

export const toAmount = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const sumAmounts = (values: string[]) =>
  values.reduce((total, value) => total + toAmount(value), 0);

/** Total already spent against a budget, from its linked expenses. */
export const budgetSpent = (budget: IBudget) =>
  (budget.expenses ?? []).reduce((total, expense) => total + expense.amount, 0);

export const usagePercentage = (spent: number, total: number) =>
  total > 0 ? Math.round((spent / total) * 100) : 0;

/** Spend on a budget grouped by category id, for the allocation rows. */
export const spentByCategory = (budget: IBudget) =>
  (budget.expenses ?? []).reduce<Record<string, number>>((acc, expense) => {
    acc[expense.categoryId] = (acc[expense.categoryId] ?? 0) + expense.amount;
    return acc;
  }, {});

/** Spend that falls inside a single week row's date range. */
export const spentInRange = (budget: IBudget, startKey: string, endKey: string) => {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  return (budget.expenses ?? [])
    .filter((expense) => {
      const on = parseDateKey(expense.expenseDate.slice(0, 10));
      return on >= start && on <= end;
    })
    .reduce((total, expense) => total + expense.amount, 0);
};

/** Red once over budget, amber as the limit approaches. */
export const usageColor = (
  percentage: number,
  palette: { primary: string; warning: string },
) => {
  if (percentage >= 100) return "#EF4444";
  if (percentage >= 80) return palette.warning;
  return palette.primary;
};
