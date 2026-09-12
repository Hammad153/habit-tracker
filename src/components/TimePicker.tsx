import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, TouchableWithoutFeedback, ScrollView } from "react-native";
import { X, Check } from "lucide-react-native";
import { useTheme } from "../modules/settings/context";
import { useFeedback } from "../utils/feedback";

export interface ApTimePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  selectedTime?: string; // format: "HH:mm" (e.g. "08:00" or "14:30")
  title?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

export const ApTimePicker: React.FC<ApTimePickerProps> = ({
  visible,
  onClose,
  onSelect,
  selectedTime = "09:00",
  title = "Select time",
}) => {
  const colors = useTheme();
  const { triggerSelection } = useFeedback();

  const [hour12, setHour12] = useState("9");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  useEffect(() => {
    if (selectedTime && selectedTime.includes(":")) {
      const [hStr, mStr] = selectedTime.split(":");
      const h = parseInt(hStr, 10);
      const isPM = h >= 12;
      const h12Val = h % 12 === 0 ? 12 : h % 12;
      setHour12(h12Val.toString());
      setPeriod(isPM ? "PM" : "AM");

      const m = parseInt(mStr, 10);
      const roundedMin = (Math.round(m / 5) * 5) % 60;
      setMinute(roundedMin.toString().padStart(2, "0"));
    }
  }, [selectedTime, visible]);

  const handleConfirm = () => {
    triggerSelection();
    let h = parseInt(hour12, 10);
    if (period === "AM") {
      if (h === 12) h = 0;
    } else {
      if (h !== 12) h += 12;
    }
    const h24 = h.toString().padStart(2, "0");
    onSelect(`${h24}:${minute}`);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: colors.overlay }}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              className="w-full max-w-[340px] bg-background-elevated rounded-2xl p-5"
              style={{
                shadowColor: colors.inkPrimary,
                shadowOpacity: 0.16,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 12 },
                elevation: 8,
              }}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-[18px] font-bold text-ink-primary">
                  {title}
                </Text>
                <Pressable
                  onPress={onClose}
                  hitSlop={8}
                  className="w-8 h-8 rounded-pill bg-background-surface items-center justify-center active:opacity-70"
                >
                  <X size={18} color={colors.inkPrimary} strokeWidth={2} />
                </Pressable>
              </View>

              {/* Formatted Large Time Display */}
              <View
                className="w-full py-2.5 rounded-xl items-center justify-center mb-4 border"
                style={{
                  backgroundColor: colors.surface || colors.backgroundSurface,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="text-[24px] font-bold tracking-tight"
                  style={{ color: colors.inkPrimary }}
                >
                  {hour12.padStart(2, "0")}:{minute} {period}
                </Text>
              </View>

              {/* 3 Columns: Hour | Minute | AM/PM */}
              <View className="flex-row gap-2.5 mb-5">
                {/* Column 1: Hour */}
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1.5 text-center">
                    Hour
                  </Text>
                  <View
                    className="rounded-xl border p-1"
                    style={{
                      height: 180,
                      borderColor: colors.border,
                      backgroundColor: colors.surface || colors.backgroundSurface,
                    }}
                  >
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <View className="gap-1 py-1">
                        {HOURS.map((h) => {
                          const isSel = hour12 === h;
                          return (
                            <Pressable
                              key={h}
                              onPress={() => {
                                triggerSelection();
                                setHour12(h);
                              }}
                              className="h-9 rounded-lg items-center justify-center active:opacity-80"
                              style={{
                                backgroundColor: isSel ? colors.inkPrimary : "transparent",
                              }}
                            >
                              <Text
                                className="text-[14px] font-semibold"
                                style={{
                                  color: isSel ? colors.inkInverse : colors.inkPrimary,
                                }}
                              >
                                {h}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>
                </View>

                {/* Column 2: Minute */}
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1.5 text-center">
                    Minute
                  </Text>
                  <View
                    className="rounded-xl border p-1"
                    style={{
                      height: 180,
                      borderColor: colors.border,
                      backgroundColor: colors.surface || colors.backgroundSurface,
                    }}
                  >
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <View className="gap-1 py-1">
                        {MINUTES.map((m) => {
                          const isSel = minute === m;
                          return (
                            <Pressable
                              key={m}
                              onPress={() => {
                                triggerSelection();
                                setMinute(m);
                              }}
                              className="h-9 rounded-lg items-center justify-center active:opacity-80"
                              style={{
                                backgroundColor: isSel ? colors.inkPrimary : "transparent",
                              }}
                            >
                              <Text
                                className="text-[14px] font-semibold"
                                style={{
                                  color: isSel ? colors.inkInverse : colors.inkPrimary,
                                }}
                              >
                                :{m}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>
                </View>

                {/* Column 3: AM / PM */}
                <View className="w-16">
                  <Text className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider mb-1.5 text-center">
                    Period
                  </Text>
                  <View
                    className="rounded-xl border p-1 justify-around"
                    style={{
                      height: 180,
                      borderColor: colors.border,
                      backgroundColor: colors.surface || colors.backgroundSurface,
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        triggerSelection();
                        setPeriod("AM");
                      }}
                      className="h-16 rounded-lg items-center justify-center active:opacity-80"
                      style={{
                        backgroundColor: period === "AM" ? colors.inkPrimary : "transparent",
                      }}
                    >
                      <Text
                        className="text-[14px] font-bold"
                        style={{
                          color: period === "AM" ? colors.inkInverse : colors.inkPrimary,
                        }}
                      >
                        AM
                      </Text>
                    </Pressable>

                    <View
                      className="h-[1px] w-full"
                      style={{ backgroundColor: colors.border }}
                    />

                    <Pressable
                      onPress={() => {
                        triggerSelection();
                        setPeriod("PM");
                      }}
                      className="h-16 rounded-lg items-center justify-center active:opacity-80"
                      style={{
                        backgroundColor: period === "PM" ? colors.inkPrimary : "transparent",
                      }}
                    >
                      <Text
                        className="text-[14px] font-bold"
                        style={{
                          color: period === "PM" ? colors.inkInverse : colors.inkPrimary,
                        }}
                      >
                        PM
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Confirm Button */}
              <Pressable
                onPress={handleConfirm}
                className="w-full py-3 rounded-xl items-center justify-center flex-row gap-2 active:opacity-90"
                style={{ backgroundColor: colors.inkPrimary }}
              >
                <Check size={18} color={colors.inkInverse} strokeWidth={2.4} />
                <Text
                  className="text-[15px] font-semibold"
                  style={{ color: colors.inkInverse }}
                >
                  Set Time
                </Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ApTimePicker;
