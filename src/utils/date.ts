export const formatDate = (date: Date) => {
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  return { dayName, month, day };
};

export const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const normalizeDateKey = (date: string | Date) => {
  if (date instanceof Date) return toDateKey(date);
  return date.slice(0, 10);
};

export const isSameDateKey = (date: string | Date, key: string) =>
  normalizeDateKey(date) === key;
