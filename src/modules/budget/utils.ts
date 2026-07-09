import { toDateKey } from "@/src/utils/date";
import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isAfter,
  startOfMonth,
} from "date-fns";
import { BudgetPeriodType } from "./model";

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
