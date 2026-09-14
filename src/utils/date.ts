export const formatDate = (date: Date | string | undefined | null) => {
  if (!date) return { dayName: "", month: "", day: 0 };
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return { dayName: "", month: "", day: 0 };
  const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate();
  return { dayName, month, day };
};

export const toDateKey = (date: Date | string | undefined | null): string => {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const normalizeDateKey = (date: string | Date | undefined | null): string => {
  if (!date) return "";
  if (date instanceof Date) {
    if (isNaN(date.getTime())) return "";
    return toDateKey(date);
  }
  if (typeof date === "string") return date.slice(0, 10);
  return "";
};

/**
 * Date keys are calendar days. Build them in local time so `YYYY-MM-DD` does
 * not render as the previous day in timezones west of UTC.
 */
export const parseDateKey = (key: string | undefined | null): Date => {
  if (!key) return new Date();
  const normalized = normalizeDateKey(key);
  if (!normalized || !normalized.includes("-")) return new Date();
  const [year, month, day] = normalized.split("-").map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return new Date();
  return new Date(year, month - 1, day);
};

export const isSameDateKey = (date: string | Date | undefined | null, key: string): boolean => {
  if (!date || !key) return false;
  return normalizeDateKey(date) === key;
};

export const isHabitEligibleForDate = (
  habit: { createdAt?: string | Date },
  date: Date,
): boolean => {
  const todayKey = toDateKey(new Date());
  const selectedKey = toDateKey(date);

  // Ensure today's view (and future views) remains unchanged and shows all active habits.
  if (selectedKey >= todayKey) {
    return true;
  }

  if (!habit.createdAt) {
    return true;
  }

  const createdKey = toDateKey(new Date(habit.createdAt));
  return createdKey <= selectedKey;
};
