import React, { useEffect, useState, useMemo } from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import { Plus, Minus, CheckCircle2, Leaf, ShieldAlert, Check } from "lucide-react-native";
import { ApText } from "@/src/components/Text";
import { ApModal } from "@/src/components/Modal";
import { useTheme } from "@/src/modules/settings/context";
import { useFeedback } from "@/src/utils/feedback";
import { CompletionKind } from "@/src/modules/identities/model";

interface VersionOption {
  kind: CompletionKind;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  description?: string | null;
  hint: string;
}

interface LogValueModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave?: (value: number, kind: CompletionKind) => void;
  initialValue?: number;
  currentValue?: number;
  goal: number;
  unit?: string;
  title?: string;
  habitTitle?: string;
  habitId?: string;
  selectedDate?: string;
  fullBehavior?: string | null;
  minimumBehavior?: string | null;
  emergencyMinimum?: string | null;
}

const COIN_HINTS: Record<CompletionKind, number> = {
  FULL: 10,
  MINIMUM: 3,
  EMERGENCY: 2,
};

const getStepSize = (goal: number): number => {
  if (goal <= 5) return 1;
  if (goal <= 15) return 1;
  if (goal <= 60) return 5;
  if (goal <= 500) return 25;
  if (goal <= 2000) return 100;
  return 500;
};

const getQuickIncrements = (goal: number): number[] => {
  if (goal <= 5) return [1, 2];
  if (goal <= 15) return [1, 5];
  if (goal <= 60) return [5, 15];
  if (goal <= 500) return [25, 50];
  if (goal <= 2000) return [250, 500];
  return [1000, 2500];
};

const LogValueModal: React.FC<LogValueModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialValue,
  currentValue,
  goal,
  unit = "times",
  title,
  habitTitle,
  fullBehavior,
  minimumBehavior,
  emergencyMinimum,
}) => {
  const initVal = initialValue ?? currentValue ?? 0;
  const habitName = title || habitTitle || "Habit";
  const [value, setValue] = useState(initVal.toString());
  const [kind, setKind] = useState<CompletionKind>("FULL");
  const colors = useTheme();
  const { triggerSuccess, triggerHaptic } = useFeedback();

  const numGoal = Math.max(1, goal || 1);
  const stepSize = useMemo(() => getStepSize(numGoal), [numGoal]);
  const quickIncrements = useMemo(() => getQuickIncrements(numGoal), [numGoal]);

  const versions: VersionOption[] = useMemo(() => {
    const list: VersionOption[] = [
      {
        kind: "FULL",
        label: "Full",
        icon: CheckCircle2,
        description: fullBehavior,
        hint: `+${COIN_HINTS.FULL} coins`,
      },
    ];
    if (minimumBehavior) {
      list.push({
        kind: "MINIMUM",
        label: "Minimum",
        icon: Leaf,
        description: minimumBehavior,
        hint: `+${COIN_HINTS.MINIMUM} coins`,
      });
    }
    if (emergencyMinimum) {
      list.push({
        kind: "EMERGENCY",
        label: "Emergency",
        icon: ShieldAlert,
        description: emergencyMinimum,
        hint: `+${COIN_HINTS.EMERGENCY} coins`,
      });
    }
    return list;
  }, [fullBehavior, minimumBehavior, emergencyMinimum]);

  const hasMultipleVersions = versions.length > 1;

  useEffect(() => {
    if (isVisible) {
      setValue(initVal.toString());
      setKind("FULL");
    }
  }, [isVisible, initVal]);

  const numValue = parseFloat(value) || 0;
  const progressPercent = Math.min(100, Math.max(0, (numValue / numGoal) * 100));
  const isTargetMet = numValue >= numGoal;

  const handleStep = (delta: number) => {
    triggerHaptic();
    const nextVal = Math.max(0, Math.round((numValue + delta) * 10) / 10);
    setValue(nextVal.toString());
  };

  const handleSetExact = (target: number) => {
    triggerHaptic();
    setValue(target.toString());
  };

  const selectedVersion =
    versions.find((option) => option.kind === kind) ?? versions[0];

  const handleSave = () => {
    triggerSuccess();
    const finalValue = kind === "FULL" ? numValue : numGoal;
    onSave?.(finalValue, kind);
    onClose();
  };

  return (
    <ApModal visible={isVisible} onClose={onClose} title={`Log ${habitName}`}>
      {/* Version selector (only shown if habit defines minimum or emergency behaviors) */}
      {hasMultipleVersions && (
        <View className="flex-row mb-4 gap-2">
          {versions.map((option) => {
            const active = kind === option.kind;
            const IconComp = option.icon;
            return (
              <TouchableOpacity
                key={option.kind}
                onPress={() => setKind(option.kind)}
                className="flex-1 items-center py-2.5 rounded-xl border"
                style={{
                  backgroundColor: active ? colors.accentLight : colors.surface,
                  borderColor: active ? colors.primary : colors.surfaceBorder,
                }}
              >
                <IconComp
                  size={16}
                  color={active ? colors.primary : colors.textMuted}
                />
                <ApText
                  size="xs"
                  font={active ? "semibold" : "normal"}
                  color={active ? colors.primary : colors.textSecondary}
                  className="mt-1"
                >
                  {option.label}
                </ApText>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedVersion?.description && (
        <View
          className="mb-4 p-3 rounded-xl"
          style={{ backgroundColor: colors.surface2 }}
        >
          <ApText size="xs" color={colors.textSecondary}>
            {selectedVersion.description}
          </ApText>
        </View>
      )}

      {kind === "FULL" ? (
        <View className="mb-5">
          {/* Progress summary bar */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-1.5">
              <ApText size="xs" font="medium" color={colors.textSecondary}>
                Progress
              </ApText>
              <ApText size="xs" font="semibold" color={isTargetMet ? colors.primary : colors.textPrimary}>
                {numValue} of {numGoal} {unit} ({Math.round(progressPercent)}%)
              </ApText>
            </View>
            <View
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: colors.surface2 }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: isTargetMet ? colors.primary : colors.accent,
                }}
              />
            </View>
          </View>

          {/* Stepper controls */}
          <View className="flex-row items-center justify-center gap-3 my-2">
            {/* Minus button */}
            <TouchableOpacity
              onPress={() => handleStep(-stepSize)}
              disabled={numValue <= 0}
              activeOpacity={0.7}
              className="w-12 h-12 rounded-2xl border items-center justify-center"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
                opacity: numValue <= 0 ? 0.4 : 1,
              }}
            >
              <Minus size={20} color={colors.textPrimary} strokeWidth={2.4} />
            </TouchableOpacity>

            {/* Value Input Box */}
            <View
              className="flex-1 max-w-[160px] h-14 rounded-2xl border flex-row items-center justify-center px-3"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              }}
            >
              <TextInput
                value={value}
                onChangeText={(text) => setValue(text.replace(/[^0-9.]/g, ""))}
                keyboardType="numeric"
                className="text-2xl font-bold text-center w-full"
                style={{
                  color: colors.textPrimary,
                  paddingVertical: 0,
                }}
                selectTextOnFocus
              />
            </View>

            {/* Plus button */}
            <TouchableOpacity
              onPress={() => handleStep(stepSize)}
              activeOpacity={0.7}
              className="w-12 h-12 rounded-2xl border items-center justify-center"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
              }}
            >
              <Plus size={20} color={colors.textPrimary} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          {/* Quick Increment Pills */}
          <View className="flex-row flex-wrap items-center justify-center gap-2 mt-3">
            {quickIncrements.map((inc) => (
              <TouchableOpacity
                key={inc}
                onPress={() => handleStep(inc)}
                activeOpacity={0.7}
                className="px-3 py-1.5 rounded-full border"
                style={{
                  backgroundColor: colors.surface2,
                  borderColor: colors.surfaceBorder,
                }}
              >
                <ApText size="xs" font="medium" color={colors.textPrimary}>
                  +{inc.toLocaleString()} {unit}
                </ApText>
              </TouchableOpacity>
            ))}

            {/* Complete Habit quick button */}
            <TouchableOpacity
              onPress={() => handleSetExact(numGoal)}
              activeOpacity={0.7}
              className="px-3 py-1.5 rounded-full border flex-row items-center"
              style={{
                backgroundColor: isTargetMet ? colors.accentLight : colors.surface2,
                borderColor: isTargetMet ? colors.primary : colors.surfaceBorder,
              }}
            >
              <Check size={12} color={isTargetMet ? colors.primary : colors.textSecondary} className="mr-1" />
              <ApText
                size="xs"
                font="medium"
                color={isTargetMet ? colors.primary : colors.textSecondary}
              >
                All {numGoal.toLocaleString()}
              </ApText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="items-center my-6">
          <View
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: colors.accentLight }}
          >
            <ApText size="xs" font="medium" color={colors.primary}>
              Counts as done · earns fewer coins
            </ApText>
          </View>
        </View>
      )}

      {/* Action buttons */}
      <View className="flex-row gap-2 mt-2">
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          className="flex-1 py-3 rounded-xl border items-center justify-center"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
          }}
        >
          <ApText font="medium" color={colors.textMuted}>
            Cancel
          </ApText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.8}
          className="flex-1 py-3 rounded-xl items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          <ApText font="semibold" color={colors.inkInverse}>
            {isTargetMet ? "Complete Habit" : "Save Progress"}
          </ApText>
        </TouchableOpacity>
      </View>
    </ApModal>
  );
};

export default LogValueModal;
