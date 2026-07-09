import React, { useEffect, useMemo, useRef, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { addMonths, addYears, format, subMonths } from "date-fns";
import {
  ApContainer,
  ApDateField,
  ApHeader,
  ApScrollView,
  ApSubmitButton,
  ApText,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { toDateKey } from "@/src/utils/date";
import helper from "@/src/helper";
import { useBudgetState } from "../context";
import { BudgetPeriodType, IBudgetPayload } from "../model";
import {
  buildWeeksForMonth,
  durationInDays,
  formatRange,
  IWeekRow,
  monthBounds,
  parseDateKey,
  PERIODS_WITH_ALLOCATIONS,
  PERIOD_HELPERS,
  PERIOD_LABELS,
  PERIOD_TYPES,
  sumAmounts,
  toAmount,
} from "../utils";

const DANGER = "#EF4444";
// Budgets are forward-looking, so the picker must reach beyond today.
const MAX_DATE = addYears(new Date(), 5);

const Label = ({ children }: { children: React.ReactNode }) => {
  const colors = useTheme();
  return (
    <ApText size="xs" font="bold" color={colors.textMuted} className="mb-2 uppercase">
      {children}
    </ApText>
  );
};

const ErrorText = ({ message }: { message?: string }) =>
  message ? (
    <ApText size="xs" color={DANGER} className="mt-1">
      {message}
    </ApText>
  ) : null;

const Field = ({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  multiline = false,
  placeholder,
  error,
}: any) => {
  const colors = useTheme();
  return (
    <View className="mb-4">
      {label ? <Label>{label}</Label> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        className="rounded-2xl border px-4 py-3"
        style={{
          color: colors.textPrimary,
          backgroundColor: colors.surface,
          borderColor: error ? DANGER : colors.surfaceBorder,
          minHeight: multiline ? 88 : undefined,
        }}
      />
      <ErrorText message={error} />
    </View>
  );
};

/** Budget dates look ahead, so the picker is bounded by MAX_DATE rather than today. */
const DateField = (props: {
  label: string;
  value: string;
  onChange: (key: string) => void;
  minDate?: Date;
  error?: string;
  title?: string;
}) => <ApDateField {...props} maxDate={MAX_DATE} />;

const MonthField = ({
  label,
  month,
  onChange,
}: {
  label: string;
  month: Date;
  onChange: (next: Date) => void;
}) => {
  const colors = useTheme();
  return (
    <View className="mb-4">
      <Label>{label}</Label>
      <View
        className="flex-row items-center justify-between rounded-2xl border px-2 py-2"
        style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
      >
        <TouchableOpacity onPress={() => onChange(subMonths(month, 1))} className="p-2">
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <ApText size="base" font="bold" color={colors.textPrimary}>
          {format(month, "MMMM yyyy")}
        </ApText>
        <TouchableOpacity onPress={() => onChange(addMonths(month, 1))} className="p-2">
          <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const withEmptyValues = (
  rows: Pick<IWeekRow, "label" | "startDate" | "endDate">[],
): IWeekRow[] => rows.map((row) => ({ ...row, amount: "", note: "" }));

const BudgetFormScreen = () => {
  const colors = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const {
    budgets,
    categories,
    createBudget,
    updateBudget,
    loading,
    fetchBudgets,
    ensureCategories,
  } = useBudgetState();

  const editing = useMemo(() => budgets.find((item) => item.id === id), [budgets, id]);
  const today = useMemo(() => new Date(), []);

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [periodType, setPeriodType] = useState<BudgetPeriodType>("MONTHLY");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(toDateKey(today));
  const [startDate, setStartDate] = useState(toDateKey(today));
  const [endDate, setEndDate] = useState(toDateKey(today));
  const [month, setMonth] = useState(today);
  // Seeded for the current month so switching to Weekly never lands on an empty list.
  const [weeks, setWeeks] = useState<IWeekRow[]>(() =>
    withEmptyValues(buildWeeksForMonth(new Date())),
  );
  const [allocations, setAllocations] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetchBudgets(), ensureCategories()]);
  }, []);

  const hydratedId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!editing || hydratedId.current === editing.id) return;
    hydratedId.current = editing.id;

    const editStart = editing.startDate.slice(0, 10);
    const editEnd = editing.endDate.slice(0, 10);
    setTitle(editing.title);
    setNote(editing.note ?? "");
    setPeriodType(editing.periodType);
    setAmount(String(editing.amount));
    setDate(editStart);
    setStartDate(editStart);
    setEndDate(editEnd);
    setMonth(parseDateKey(editStart));

    const saved = editing.breakdowns ?? [];
    setWeeks(
      saved.length
        ? saved.map((week) => ({
            label: week.label,
            startDate: week.startDate.slice(0, 10),
            endDate: week.endDate.slice(0, 10),
            amount: String(week.amount),
            note: week.note ?? "",
          }))
        : withEmptyValues(buildWeeksForMonth(parseDateKey(editStart))),
    );
    setAllocations(
      Object.fromEntries(
        (editing.allocations ?? []).map((item) => [item.categoryId, String(item.amount)]),
      ),
    );
  }, [editing?.id]);

  const weeklyTotal = useMemo(() => sumAmounts(weeks.map((week) => week.amount)), [weeks]);
  const allocationTotal = useMemo(
    () => sumAmounts(Object.values(allocations)),
    [allocations],
  );
  const supportsAllocations = PERIODS_WITH_ALLOCATIONS.includes(periodType);
  const totalAmount = periodType === "WEEKLY" ? weeklyTotal : toAmount(amount);
  const allocationExceeds = supportsAllocations && allocationTotal > totalAmount;

  /** Switching period discards the fields that no longer apply. */
  const changePeriod = (next: BudgetPeriodType) => {
    if (next === periodType) return;
    setPeriodType(next);
    setSubmitted(false);

    if (next === "WEEKLY") {
      setWeeks(withEmptyValues(buildWeeksForMonth(month)));
      setAmount("");
      setAllocations({});
      return;
    }
    if (next === "DAILY") {
      setAllocations({});
      return;
    }
    if (next === "CUSTOM") {
      setStartDate(toDateKey(today));
      setEndDate(toDateKey(today));
    }
  };

  const changeMonth = (next: Date) => {
    setMonth(next);
    if (periodType !== "WEEKLY") return;
    // Keep whatever the user already typed for weeks that still exist.
    const previous = new Map(weeks.map((week) => [week.label, week]));
    setWeeks(
      buildWeeksForMonth(next).map((week) => ({
        ...week,
        amount: previous.get(week.label)?.amount ?? "",
        note: previous.get(week.label)?.note ?? "",
      })),
    );
  };

  const updateWeek = (index: number, patch: Partial<IWeekRow>) =>
    setWeeks((current) =>
      current.map((week, position) => (position === index ? { ...week, ...patch } : week)),
    );

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Title is required.";

    if (periodType === "WEEKLY") {
      if (!weeks.length) next.weeks = "Select a month to generate weeks.";
      weeks.forEach((week, index) => {
        if (!(toAmount(week.amount) > 0)) {
          next[`week-${index}`] = "Enter an amount greater than 0.";
        }
      });
    } else if (!(toAmount(amount) > 0)) {
      next.amount = "Amount must be greater than 0.";
    }

    if (periodType === "CUSTOM" && parseDateKey(endDate) < parseDateKey(startDate)) {
      next.endDate = "End date cannot be earlier than start date.";
    }

    if (allocationExceeds) {
      next.allocations = "Category allocations exceed the total budget.";
    }
    return next;
  }, [title, periodType, weeks, amount, startDate, endDate, allocationExceeds]);

  const canSave = Object.keys(errors).length === 0;
  const showError = (key: string) => (submitted ? errors[key] : undefined);

  const buildPayload = (): IBudgetPayload => {
    const base = {
      title: title.trim(),
      note: note.trim() || undefined,
      periodType,
    };

    if (periodType === "DAILY") {
      return { ...base, amount: toAmount(amount), startDate: date, endDate: date };
    }

    if (periodType === "WEEKLY") {
      const bounds = monthBounds(month);
      return {
        ...base,
        ...bounds,
        // The backend recomputes this from the rows; sending it keeps the
        // optimistic UI and the stored total in sync.
        amount: weeklyTotal,
        breakdowns: weeks.map((week) => ({
          label: week.label,
          startDate: week.startDate,
          endDate: week.endDate,
          amount: toAmount(week.amount),
          note: week.note.trim() || undefined,
        })),
      };
    }

    const range =
      periodType === "MONTHLY" ? monthBounds(month) : { startDate, endDate };
    return {
      ...base,
      ...range,
      amount: toAmount(amount),
      allocations: Object.entries(allocations)
        .filter(([, value]) => toAmount(value) > 0)
        .map(([categoryId, value]) => ({ categoryId, amount: toAmount(value) })),
    };
  };

  const submit = async () => {
    setSubmitted(true);
    if (!canSave || submitting) return;
    const payload = buildPayload();
    setSubmitting(true);
    try {
      const saved = editing
        ? await updateBudget(editing.id, payload)
        : await createBudget(payload);
      // Stay on the screen if the request failed, so nothing typed is lost.
      if (saved) router.back();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ApContainer>
      <ApHeader title={editing ? "Edit Budget" : "Add Budget"} hasBackButton />
      <ApScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View className="mt-4 px-1">
          <Field
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. July Budget"
            error={showError("title")}
          />

          <Label>Period</Label>
          <View className="flex-row flex-wrap gap-2">
            {PERIOD_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => changePeriod(type)}
                className="rounded-xl px-3 py-2"
                style={{
                  backgroundColor: periodType === type ? colors.primary : colors.surface,
                }}
              >
                <ApText
                  size="xs"
                  font="bold"
                  color={periodType === type ? colors.background : colors.textPrimary}
                >
                  {PERIOD_LABELS[type]}
                </ApText>
              </TouchableOpacity>
            ))}
          </View>
          <ApText size="xs" color={colors.textMuted} className="mb-4 mt-2">
            {PERIOD_HELPERS[periodType]}
          </ApText>

          {periodType === "DAILY" ? (
            <>
              <DateField label="Date" value={date} onChange={setDate} error={showError("date")} />
              <Field
                label="Budget amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0"
                error={showError("amount")}
              />
              <Field label="Note" value={note} onChangeText={setNote} multiline placeholder="Optional" />
            </>
          ) : null}

          {periodType === "WEEKLY" ? (
            <>
              <MonthField label="Month" month={month} onChange={changeMonth} />
              <Label>Weekly budget</Label>
              {weeks.map((week, index) => (
                <View
                  key={week.label}
                  className="mb-3 rounded-2xl border p-3"
                  style={{ backgroundColor: colors.surface, borderColor: colors.surfaceBorder }}
                >
                  <View className="mb-2 flex-row items-center justify-between">
                    <ApText size="sm" font="bold" color={colors.textPrimary}>
                      {week.label}
                    </ApText>
                    <ApText size="xs" color={colors.textMuted}>
                      {formatRange(week.startDate, week.endDate)}
                    </ApText>
                  </View>
                  <TextInput
                    value={week.amount}
                    onChangeText={(value) => updateWeek(index, { amount: value })}
                    keyboardType="decimal-pad"
                    placeholder="Amount"
                    placeholderTextColor={colors.textMuted}
                    className="mb-2 rounded-xl border px-3 py-2"
                    style={{
                      color: colors.textPrimary,
                      backgroundColor: colors.background,
                      borderColor: showError(`week-${index}`) ? DANGER : colors.surfaceBorder,
                    }}
                  />
                  <TextInput
                    value={week.note}
                    onChangeText={(value) => updateWeek(index, { note: value })}
                    placeholder="Note (optional)"
                    placeholderTextColor={colors.textMuted}
                    className="rounded-xl border px-3 py-2"
                    style={{
                      color: colors.textPrimary,
                      backgroundColor: colors.background,
                      borderColor: colors.surfaceBorder,
                    }}
                  />
                  <ErrorText message={showError(`week-${index}`)} />
                </View>
              ))}
              <View
                className="mb-4 flex-row items-center justify-between rounded-2xl p-3"
                style={{ backgroundColor: colors.primary + "16" }}
              >
                <ApText size="sm" font="semibold" color={colors.textPrimary}>
                  Total for {format(month, "MMMM")}
                </ApText>
                <ApText size="sm" font="bold" color={colors.primary}>
                  {helper.formatCurrency(weeklyTotal)}
                </ApText>
              </View>
            </>
          ) : null}

          {periodType === "MONTHLY" ? (
            <>
              <MonthField label="Month" month={month} onChange={changeMonth} />
              <Field
                label="Total budget"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0"
                error={showError("amount")}
              />
              <Field label="Description" value={note} onChangeText={setNote} multiline placeholder="Optional" />
            </>
          ) : null}

          {periodType === "CUSTOM" ? (
            <>
              <DateField
                label="Start date"
                value={startDate}
                onChange={(value) => {
                  setStartDate(value);
                  // Keep the range valid as the start moves forward.
                  if (parseDateKey(endDate) < parseDateKey(value)) setEndDate(value);
                }}
              />
              <DateField
                label="End date"
                value={endDate}
                onChange={setEndDate}
                minDate={parseDateKey(startDate)}
                error={showError("endDate")}
              />
              <View
                className="mb-4 flex-row items-center rounded-2xl p-3"
                style={{ backgroundColor: colors.accent + "16" }}
              >
                <Ionicons name="time-outline" size={16} color={colors.accent} />
                <ApText size="xs" font="semibold" color={colors.textPrimary} className="ml-2">
                  Custom period: {durationInDays(startDate, endDate)} days
                </ApText>
              </View>
              <Field
                label="Total budget"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0"
                error={showError("amount")}
              />
              <Field label="Note" value={note} onChangeText={setNote} multiline placeholder="Optional" />
            </>
          ) : null}

          {supportsAllocations && categories.length ? (
            <View className="mb-4">
              <Label>Category breakdown (optional)</Label>
              {categories.map((category) => (
                <View key={category.id} className="mb-2 flex-row items-center">
                  <View
                    className="h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: (category.color || colors.primary) + "18" }}
                  >
                    <Ionicons
                      name={(category.icon as any) || "apps-outline"}
                      size={16}
                      color={category.color || colors.primary}
                    />
                  </View>
                  <ApText size="sm" color={colors.textPrimary} className="ml-2 flex-1">
                    {category.name}
                  </ApText>
                  <TextInput
                    value={allocations[category.id] ?? ""}
                    onChangeText={(value) =>
                      setAllocations((current) => ({ ...current, [category.id]: value }))
                    }
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    className="w-32 rounded-xl border px-3 py-2 text-right"
                    style={{
                      color: colors.textPrimary,
                      backgroundColor: colors.surface,
                      borderColor: colors.surfaceBorder,
                    }}
                  />
                </View>
              ))}
              <View
                className="mt-2 rounded-2xl p-3"
                style={{ backgroundColor: allocationExceeds ? DANGER + "18" : colors.surface }}
              >
                <View className="flex-row items-center justify-between">
                  <ApText size="sm" color={colors.textSecondary}>
                    Allocated
                  </ApText>
                  <ApText
                    size="sm"
                    font="bold"
                    color={allocationExceeds ? DANGER : colors.textPrimary}
                  >
                    {helper.formatCurrency(allocationTotal)} / {helper.formatCurrency(totalAmount)}
                  </ApText>
                </View>
                {allocationExceeds ? (
                  <ApText size="xs" color={DANGER} className="mt-1">
                    Category allocations exceed the total budget by{" "}
                    {helper.formatCurrency(allocationTotal - totalAmount)}.
                  </ApText>
                ) : (
                  <ApText size="xs" color={colors.textMuted} className="mt-1">
                    {helper.formatCurrency(Math.max(totalAmount - allocationTotal, 0))} left to
                    allocate.
                  </ApText>
                )}
              </View>
            </View>
          ) : null}

          <ApSubmitButton
            label="Save Budget"
            loadingLabel="Saving budget..."
            onPress={submit}
            loading={submitting}
            enabled={canSave}
          />
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default BudgetFormScreen;
