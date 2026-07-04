import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Modal, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { ApText } from "@/src/components";
import { useSettingsState, useTheme } from "@/src/modules/settings/context";
import { useFeedback } from "@/src/utils/feedback";

// Bundled completion chime played when the timer reaches zero.
const TIMER_COMPLETE_SOUND = require("@/assets/sounds/timer-complete.wav");

interface HabitTimerProps {
  visible: boolean;
  habitTitle: string;
  color?: string;
  defaultMinutes?: number;
  onClose: () => void;
  /**
   * Fired once, automatically, when the session finishes — the caller marks the
   * habit complete for the day. Omit it (e.g. already completed today) and the
   * session simply celebrates without re-toggling.
   */
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

  // Allow the chime to sound even when the device is on silent/vibrate.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const [phase, setPhase] = useState<Phase>("setup");
  const [minutes, setMinutes] = useState(defaultMinutes);
  const [remaining, setRemaining] = useState(defaultMinutes * 60);
  // Captured at finish time so the confirmation message doesn't flip when the
  // parent re-renders (its onComplete prop clears once the habit is marked done).
  const [autoCompleted, setAutoCompleted] = useState(false);
  const totalSecondsRef = useRef(defaultMinutes * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Ensures the finish side effects (sound, haptic, auto-complete) run exactly
  // once per session, even if the tick updater is invoked twice in dev.
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
      } catch {
        // Audio is best-effort; never let it break the completion flow.
      }
    }
    // Finishing the session marks the habit done for the day automatically —
    // no need to toggle it separately on the card.
    onComplete?.();
  }, [clearTimer, onComplete, player, soundEnabled, triggerHaptic]);

  // The single source of truth for the countdown. Ticks every second while
  // running and finishes exactly once when it crosses zero.
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

  // Reset everything back to a clean setup state whenever the modal reopens.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Guarantee the interval never outlives the component.
  useEffect(() => clearTimer, [clearTimer]);

  const total = totalSecondsRef.current || 1;
  const progress = phase === "setup" ? 0 : 1 - remaining / total;

  const size = 240;
  const strokeWidth = 12;
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
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      >
        <View
          className="rounded-t-3xl px-6 pt-5 pb-10"
          style={{
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderColor: colors.surfaceBorder,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 pr-3">
              <ApText size="xs" font="bold" color={colors.textMuted} style={{ letterSpacing: 1 }}>
                TIMED SESSION
              </ApText>
              <ApText size="xl" font="bold" color={colors.textPrimary} numberOfLines={1}>
                {habitTitle}
              </ApText>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close timer"
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons name="close" size={22} color={colors.textMuted} />
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
                  <Ionicons name="checkmark-circle" size={54} color={colors.success} />
                  <ApText size="lg" font="bold" color={colors.textPrimary} className="mt-1">
                    Done!
                  </ApText>
                </>
              ) : (
                <>
                  <ApText size="3xl" font="bold" color={colors.textPrimary}>
                    {centerLabel}
                  </ApText>
                  <ApText size="sm" color={colors.textMuted} className="mt-1">
                    {phase === "setup"
                      ? "Set your duration"
                      : phase === "paused"
                        ? "Paused"
                        : "Stay focused"}
                  </ApText>
                </>
              )}
            </View>
          </View>

          {/* Setup: duration presets + stepper */}
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
                      className="w-[31%] py-3 mb-3 rounded-2xl items-center border"
                      style={{
                        backgroundColor: isSelected ? accent + "20" : colors.surface,
                        borderColor: isSelected ? accent : colors.surfaceBorder,
                      }}
                    >
                      <ApText
                        size="base"
                        font={isSelected ? "bold" : "medium"}
                        color={isSelected ? accent : colors.textSecondary}
                      >
                        {preset} min
                      </ApText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Fine adjust */}
              <View
                className="flex-row items-center justify-between rounded-2xl px-4 py-3 mt-1"
                style={{ backgroundColor: colors.surface }}
              >
                <ApText size="sm" color={colors.textMuted}>
                  Custom
                </ApText>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => adjustMinutes(-1)}
                    hitSlop={8}
                    className="w-9 h-9 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.background }}
                  >
                    <Ionicons name="remove" size={20} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <ApText size="lg" font="bold" color={colors.textPrimary} className="mx-4">
                    {minutes} min
                  </ApText>
                  <TouchableOpacity
                    onPress={() => adjustMinutes(1)}
                    hitSlop={8}
                    className="w-9 h-9 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.background }}
                  >
                    <Ionicons name="add" size={20} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              <Pressable
                onPress={startSession}
                accessibilityRole="button"
                accessibilityLabel="Start session"
                className="h-14 rounded-full items-center justify-center mt-5 flex-row"
                style={{ backgroundColor: accent }}
              >
                <Ionicons name="play" size={20} color={colors.background} />
                <ApText size="base" font="bold" color={colors.background} className="ml-2">
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
                accessibilityRole="button"
                accessibilityLabel="Reset timer"
                className="w-14 h-14 rounded-full items-center justify-center border"
                style={{ borderColor: colors.surfaceBorder, backgroundColor: colors.surface }}
              >
                <Ionicons name="refresh" size={22} color={colors.textSecondary} />
              </TouchableOpacity>

              <Pressable
                onPress={phase === "running" ? pauseSession : resumeSession}
                accessibilityRole="button"
                accessibilityLabel={phase === "running" ? "Pause timer" : "Resume timer"}
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: accent }}
              >
                <Ionicons
                  name={phase === "running" ? "pause" : "play"}
                  size={30}
                  color={colors.background}
                />
              </Pressable>

              <TouchableOpacity
                onPress={handleFinish}
                accessibilityRole="button"
                accessibilityLabel="Finish session"
                className="w-14 h-14 rounded-full items-center justify-center border"
                style={{ borderColor: colors.surfaceBorder, backgroundColor: colors.surface }}
              >
                <Ionicons name="flag" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Done actions — the habit is already marked complete automatically. */}
          {phase === "done" && (
            <View className="mt-2">
              <View className="items-center mb-4 px-2">
                {autoCompleted ? (
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    <ApText size="sm" font="semibold" color={colors.success} className="ml-1 text-center">
                      Marked complete for today
                    </ApText>
                  </View>
                ) : (
                  <ApText size="sm" color={colors.textMuted} className="text-center">
                    Already done today — nice work staying consistent!
                  </ApText>
                )}
              </View>
              <Pressable
                onPress={handleClose}
                accessibilityRole="button"
                accessibilityLabel="Close timer"
                className="h-14 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.success }}
              >
                <ApText size="base" font="bold" color={colors.background}>
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
