import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Modal, TouchableOpacity, Pressable } from "react-native";
import { X, Play, Pause, RotateCcw, Flag, Check } from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { ApText } from "@/src/components";
import { useSettingsState, useTheme } from "@/src/modules/settings/context";
import { useFeedback } from "@/src/utils/feedback";

const TIMER_COMPLETE_SOUND = require("@/assets/sounds/timer-complete.wav");

interface HabitTimerProps {
  visible: boolean;
  habitTitle: string;
  color?: string;
  defaultMinutes?: number;
  onClose: () => void;
  onComplete?: () => void;
}

type Phase = "setup" | "running" | "paused" | "done";

const DURATION_PRESETS = [5, 10, 15, 20, 25, 30];
const MIN_MINUTES = 1;
const MAX_MINUTES = 120;

const formatClock = (totalSeconds: number) => {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

const HabitTimer: React.FC<HabitTimerProps> = ({
  visible,
  habitTitle,
  color,
  defaultMinutes = 15,
  onClose,
  onComplete,
}) => {
  const colors = useTheme();
  const { soundEnabled } = useSettingsState();
  const { triggerHaptic } = useFeedback();
  const accent = color || colors.primary;

  const player = useAudioPlayer(TIMER_COMPLETE_SOUND);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const [phase, setPhase] = useState<Phase>("setup");
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [remaining, setRemaining] = useState(defaultMinutes * 60);
  const [autoCompleted, setAutoCompleted] = useState(false);
  const totalSecondsRef = useRef(defaultMinutes * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearTimer();
    setRemaining(0);
    setPhase("done");
    setAutoCompleted(!!onComplete);
    triggerHaptic(Haptics.NotificationFeedbackType.Success);
    if (soundEnabled) {
      try {
        player.seekTo(0);
        player.play();
      } catch {}
    }
    onComplete?.();
  }, [clearTimer, onComplete, player, soundEnabled, triggerHaptic]);

  const startTicking = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, handleFinish]);

  const startSession = useCallback(() => {
    const total = minutes * 60;
    totalSecondsRef.current = total;
    setRemaining(total);
    setPhase("running");
    finishedRef.current = false;
    setAutoCompleted(false);
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    startTicking();
  }, [minutes, startTicking, triggerHaptic]);

  const pauseSession = useCallback(() => {
    clearTimer();
    setPhase("paused");
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
  }, [clearTimer, triggerHaptic]);

  const resumeSession = useCallback(() => {
    setPhase("running");
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    startTicking();
  }, [startTicking, triggerHaptic]);

  const resetSession = useCallback(() => {
    clearTimer();
    setRemaining(totalSecondsRef.current);
    setPhase("setup");
    finishedRef.current = false;
    setAutoCompleted(false);
  }, [clearTimer]);

  const handleClose = useCallback(() => {
    clearTimer();
    onClose();
  }, [clearTimer, onClose]);

  useEffect(() => {
    if (visible) {
      clearTimer();
      setMinutes(defaultMinutes);
      totalSecondsRef.current = defaultMinutes * 60;
      setRemaining(defaultMinutes * 60);
      setPhase("setup");
      finishedRef.current = false;
      setAutoCompleted(false);
    }
  }, [visible]);

  useEffect(() => clearTimer, [clearTimer]);

  const total = totalSecondsRef.current || 1;
  const progress = phase === "setup" ? 0 : 1 - remaining / total;

  const size = 220;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const adjustMinutes = (delta: number) => {
    setMinutes((prev) => {
      const next = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, prev + delta));
      totalSecondsRef.current = next * 60;
      setRemaining(next * 60);
      return next;
    });
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
  };

  const ringColor = phase === "done" ? colors.success : accent;

  const centerLabel = useMemo(() => {
    if (phase === "setup") return `${minutes}:00`;
    return formatClock(remaining);
  }, [minutes, phase, remaining]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: colors.overlay }}
      >
        <View
          className="rounded-t-3xl px-6 pt-5 pb-10"
          style={{
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderColor: colors.surfaceBorder,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 pr-3">
              <ApText size="xs" font="medium" color={colors.textMuted} style={{ letterSpacing: 0.8 }} className="uppercase">
                Timed Session
              </ApText>
              <ApText size="lg" font="semibold" color={colors.textPrimary} numberOfLines={1}>
                {habitTitle}
              </ApText>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={12}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.surface2 }}
            >
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Progress ring */}
          <View className="items-center justify-center my-4">
            <Svg width={size} height={size}>
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={colors.surfaceBorder}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={ringColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
              />
            </Svg>
            <View className="absolute items-center justify-center">
              {phase === "done" ? (
                <>
                  <Check size={44} color={colors.primary} />
                  <ApText size="base" font="semibold" color={colors.textPrimary} className="mt-1">
                    Done!
                  </ApText>
                </>
              ) : (
                <>
                  <ApText size="3xl" font="semibold" color={colors.textPrimary} style={{ letterSpacing: -0.5 }}>
                    {centerLabel}
                  </ApText>
                  <ApText size="xs" color={colors.textMuted} className="mt-1">
                    {phase === "setup"
                      ? "Set duration"
                      : phase === "paused"
                        ? "Paused"
                        : "Stay focused"}
                  </ApText>
                </>
              )}
            </View>
          </View>

          {/* Setup */}
          {phase === "setup" && (
            <View className="mt-2">
              <View className="flex-row flex-wrap justify-between">
                {DURATION_PRESETS.map((preset) => {
                  const isSelected = minutes === preset;
                  return (
                    <TouchableOpacity
                      key={preset}
                      onPress={() => {
                        setMinutes(preset);
                        totalSecondsRef.current = preset * 60;
                        setRemaining(preset * 60);
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      className="w-[31%] py-2.5 mb-2.5 rounded-xl items-center"
                      style={{
                        backgroundColor: isSelected ? colors.accentLight : colors.surface2,
                      }}
                    >
                      <ApText
                        size="sm"
                        font={isSelected ? "semibold" : "medium"}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      >
                        {preset} min
                      </ApText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Pressable
                onPress={startSession}
                accessibilityRole="button"
                accessibilityLabel="Start session"
                className="h-12 rounded-full items-center justify-center mt-4 flex-row"
                style={{ backgroundColor: accent }}
              >
                <Play size={16} color={colors.background} />
                <ApText size="sm" font="semibold" color={colors.background} className="ml-2">
                  Start Session
                </ApText>
              </Pressable>
            </View>
          )}

          {/* Running / paused controls */}
          {(phase === "running" || phase === "paused") && (
            <View className="flex-row items-center justify-center gap-4 mt-4">
              <TouchableOpacity
                onPress={resetSession}
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.surface2 }}
              >
                <RotateCcw size={18} color={colors.textSecondary} />
              </TouchableOpacity>

              <Pressable
                onPress={phase === "running" ? pauseSession : resumeSession}
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{ backgroundColor: accent }}
              >
                {phase === "running" ? (
                  <Pause size={24} color={colors.background} />
                ) : (
                  <Play size={24} color={colors.background} />
                )}
              </Pressable>

              <TouchableOpacity
                onPress={handleFinish}
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.surface2 }}
              >
                <Flag size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Done */}
          {phase === "done" && (
            <View className="mt-2">
              <Pressable
                onPress={handleClose}
                className="h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <ApText size="sm" font="semibold" color={colors.background}>
                  Done
                </ApText>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default HabitTimer;
