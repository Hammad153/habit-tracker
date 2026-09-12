import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import { CheckCircle2, Leaf, ShieldAlert } from "lucide-react-native";
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
  const { triggerSuccess } = useFeedback();

  const versions: VersionOption[] = [
    {
      kind: "FULL",
      label: "Full",
      icon: CheckCircle2,
      description: fullBehavior,
      hint: `+${COIN_HINTS.FULL} coins`,
    },
    ...(minimumBehavior
      ? [
          {
            kind: "MINIMUM" as const,
            label: "Minimum",
            icon: Leaf,
            description: minimumBehavior,
            hint: `+${COIN_HINTS.MINIMUM} coins`,
          },
        ]
      : []),
    ...(emergencyMinimum
      ? [
          {
            kind: "EMERGENCY" as const,
            label: "Emergency",
            icon: ShieldAlert,
            description: emergencyMinimum,
            hint: `+${COIN_HINTS.EMERGENCY} coins`,
          },
        ]
      : []),
  ];

  useEffect(() => {
    if (isVisible) {
      setValue(initVal.toString());
      setKind("FULL");
    }
  }, [isVisible, initialValue]);

  const selectedVersion =
    versions.find((option) => option.kind === kind) ?? versions[0];

  const handleSave = () => {
    triggerSuccess();
    onSave?.(
      kind === "FULL" ? parseFloat(value) || 0 : goal,
      kind,
    );
    onClose();
  };

  return (
    <ApModal visible={isVisible} onClose={onClose} title={`Log ${habitName}`}>
      {/* Version selector */}
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
        <View className="items-center mb-6">
          <View className="flex-row items-baseline">
            <TextInput
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              className="text-4xl font-semibold mr-2"
              style={{ color: colors.textPrimary }}
              autoFocus
              selectTextOnFocus
            />
            <ApText size="base" color={colors.textMuted} font="medium">
              / {goal} {unit}
            </ApText>
          </View>
        </View>
      ) : (
        <View className="items-center mb-6">
          <View
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: colors.accentLight }}
          >
            <ApText size="xs" font="medium" color={colors.primary}>
              Counts as done · earns fewer coins
            </ApText>
          </View>
        </View>
      )}

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={onClose}
          className="flex-1 py-3 rounded-xl border items-center"
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
          className="flex-1 py-3 rounded-xl items-center"
          style={{ backgroundColor: colors.primary }}
        >
          <ApText font="semibold" color={colors.background}>
            {kind === "FULL" ? "Save" : "Done"}
          </ApText>
        </TouchableOpacity>
      </View>
    </ApModal>
  );
};

export default LogValueModal;
