import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { ApText } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";

export const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

export const formatNumber = (value: unknown) =>
  typeof value === "number" ? value.toLocaleString() : "—";

export const formatPercent = (value: unknown) =>
  typeof value === "number" ? `${Math.round(value * 100)}%` : "—";

export const MetricCard = ({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) => {
  const colors = useTheme();
  return (
    <View
      className="min-w-[150px] flex-1 rounded-2xl border p-4"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.surfaceBorder,
      }}
    >
      <ApText size="sm" color={colors.textMuted}>
        {label}
      </ApText>
      <ApText
        size="2xl"
        font="bold"
        color={colors.textPrimary}
        className="mt-2"
      >
        {value}
      </ApText>
      {detail && (
        <ApText size="xs" color={colors.textMuted} className="mt-1">
          {detail}
        </ApText>
      )}
    </View>
  );
};

export const StatusBadge = ({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "success" | "danger" | "warning" | "neutral";
}) => {
  const colors = useTheme();
  const toneColor =
    tone === "success"
      ? colors.success
      : tone === "danger"
        ? colors.danger
        : tone === "warning"
          ? colors.warning
          : colors.textMuted;
  return (
    <View
      className="self-start rounded-full px-2.5 py-1"
      style={{ backgroundColor: `${toneColor}20` }}
    >
      <ApText size="xs" font="bold" color={toneColor}>
        {label}
      </ApText>
    </View>
  );
};

export const SearchField = ({
  value,
  onChangeText,
  placeholder = "Search",
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) => {
  const colors = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      className="min-h-12 flex-1 rounded-xl border px-4"
      style={{
        color: colors.textPrimary,
        backgroundColor: colors.surface,
        borderColor: colors.surfaceBorder,
      }}
      returnKeyType="search"
    />
  );
};

export const EmptyState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const colors = useTheme();
  return (
    <View
      className="items-center rounded-2xl border p-8"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.surfaceBorder,
      }}
    >
      <ApText size="lg" font="bold" color={colors.textPrimary}>
        {title}
      </ApText>
      <ApText size="sm" color={colors.textMuted} className="mt-2 text-center">
        {description}
      </ApText>
    </View>
  );
};

export const ErrorState = ({ onRetry }: { onRetry: () => void }) => {
  const colors = useTheme();
  return (
    <View
      className="items-center rounded-2xl border p-8"
      style={{ backgroundColor: colors.surface, borderColor: colors.danger }}
    >
      <ApText size="base" font="bold" color={colors.textPrimary}>
        Unable to load this page
      </ApText>
      <ApText size="sm" color={colors.textMuted} className="mt-2 text-center">
        Check your connection and try again.
      </ApText>
      <Pressable
        onPress={onRetry}
        className="mt-4 rounded-xl px-4 py-3"
        style={{ backgroundColor: colors.primary }}
      >
        <ApText font="bold" color={colors.background}>
          Retry
        </ApText>
      </Pressable>
    </View>
  );
};

export const Row = ({ children }: { children: React.ReactNode }) => {
  const colors = useTheme();
  return (
    <View
      className="border-b py-4"
      style={{ borderBottomColor: colors.surfaceBorder }}
    >
      {children}
    </View>
  );
};
