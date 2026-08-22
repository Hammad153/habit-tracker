import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components/Text";
import { ApModal } from "@/src/components/Modal";
import { useTheme } from "@/src/modules/settings/context";
import { useFeedback } from "@/src/utils/feedback";
import { CompletionKind } from "@/src/modules/identities/model";

interface VersionOption {
  kind: CompletionKind;
  label: string;
  icon: string;
  description?: string | null;
  hint: string;
}

interface LogValueModalProps {
  isVisible: boolean;
  onClose: () => void;
  /** Receives the logged quantity AND the chosen version. */
  onSave: (value: number, kind: CompletionKind) => void;
  initialValue: number;
  goal: number;
  unit?: string;
  title: string;
  /** Configured fallback versions — omitted options are not offered. */
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
  goal,
  unit = "times",
  title,
  fullBehavior,
  minimumBehavior,
  emergencyMinimum,
}) => {
  const [value, setValue] = useState(initialValue.toString());
  const [kind, setKind] = useState<CompletionKind>("FULL");
  const colors = useTheme();
  const { triggerSuccess } = useFeedback();

  const versions: VersionOption[] = [
    {
      kind: "FULL",
      label: "Full",
      icon: "checkmark-circle-outline",
      description: fullBehavior,
      hint: `+${COIN_HINTS.FULL} coins`,
    },
    ...(minimumBehavior
      ? [
          {
            kind: "MINIMUM" as const,
            label: "Minimum",
            icon: "leaf-outline",
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
            icon: "medkit-outline",
            description: emergencyMinimum,
            hint: `+${COIN_HINTS.EMERGENCY} coins`,
          },
        ]
      : []),
  ];

  useEffect(() => {
    if (isVisible) {
      setValue(initialValue.toString());
      setKind("FULL");
    }
  }, [isVisible, initialValue]);

  const selectedVersion =
    versions.find((option) => option.kind === kind) ?? versions[0];

  const handleSave = () => {
    triggerSuccess();
    // Reduced versions always count as success regardless of quantity; the
    // server records the goal as the value for them.
    onSave(
      kind === "FULL" ? parseFloat(value) || 0 : goal,
      kind,
    );
    onClose();
  };

  return (
    <ApModal visible={isVisible} onClose={onClose} title={`Log ${title}`}>
      {/* Version selector */}
      <View className="flex-row mb-4">
        {versions.map((option) => {
          const active = kind === option.kind;
          return (
            <TouchableOpacity
              key={option.kind}
              onPress={() => setKind(option.kind)}
              className="flex-1 items-center py-3 rounded-2xl mr-1.5"
              style={{
                backgroundColor: active
                  ? colors.primary + "1E"
                  : colors.surfaceBorder + "40",
                borderWidth: 1.5,
                borderColor: active ? colors.primary : "transparent",
              }}
            >
              <Ionicons
                name={option.icon as any}
                size={18}
                color={active ? colors.primary : colors.textMuted}
              />
              <ApText
                size="xs"
                font={active ? "bold" : "normal"}
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
          style={{ backgroundColor: colors.surfaceBorder + "30" }}
        >
          <ApText size="xs" color={colors.textSecondary}>
            {selectedVersion.description}
          </ApText>
        </View>
      )}

      {/* Quantity entry only matters for the full version */}
      {kind === "FULL" ? (
        <View className="items-center mb-6">
          <View className="flex-row items-baseline">
            <TextInput
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              className="text-5xl font-bold mr-2"
              style={{ color: colors.primary }}
              autoFocus
              selectTextOnFocus
            />
            <ApText size="lg" color={colors.textMuted} font="semibold">
              / {goal} {unit}
            </ApText>
          </View>
        </View>
      ) : (
        <View className="items-center mb-6">
          <View
            className="px-4 py-2 rounded-full"
            style={{ backgroundColor: colors.primary + "14" }}
          >
            <ApText size="xs" font="semibold" color={colors.primary}>
              Counts as done · earns fewer coins than full
            </ApText>
          </View>
        </View>
      )}

      <View className="flex-row space-x-3 gap-x-2">
        <TouchableOpacity
          onPress={onClose}
          className="flex-1 py-4 rounded-2xl border items-center"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
          }}
        >
          <ApText font="semibold" color={colors.textMuted}>
            Cancel
          </ApText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          className="flex-1 py-4 rounded-2xl items-center"
          style={{ backgroundColor: colors.primary }}
        >
          <ApText font="bold" color={colors.background}>
            {kind === "FULL" ? "Save Progress" : `Done · ${selectedVersion?.hint ?? ""}`}
          </ApText>
        </TouchableOpacity>
      </View>
    </ApModal>
  );
};

export default LogValueModal;
