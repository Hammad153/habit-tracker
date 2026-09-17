import React from "react";
import { Pressable, Text, View } from "react-native";
import { Check, Clock3, CircleAlert } from "lucide-react-native";
import { useTheme } from "@/src/modules/settings/context";
import { getHabitLucideIcon } from "@/src/utils/icons";
import { CalendarEvent } from "../types";

interface Props { event: CalendarEvent; onToggle: () => void; }
export const CalendarEventCard = ({ event, onToggle }: Props) => {
  const colors = useTheme(); const Icon = getHabitLucideIcon(event.habit.icon); const status = event.status;
  const tone = status === "done" ? colors.success : status === "missed" ? colors.danger : colors.accent;
  const StatusIcon = status === "done" ? Check : status === "missed" ? CircleAlert : Clock3;
  const label = status === "done" ? "Done" : status === "missed" ? "Missed" : "Upcoming";
  const time = event.habit.scheduledTime ? new Date(`2000-01-01T${event.habit.scheduledTime}:00`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "Anytime";
  return <Pressable onPress={onToggle} className="flex-row rounded-2xl overflow-hidden active:opacity-80" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder }} accessibilityLabel={`${event.habit.title}, ${label}`}><View style={{ width: 5, backgroundColor: tone }} /><View className="flex-1 flex-row items-center p-4"><View className="h-11 w-11 rounded-xl items-center justify-center" style={{ backgroundColor: event.habit.iconBg || colors.accentSoft }}><Icon size={21} color={event.habit.iconColor || tone} strokeWidth={2} /></View><View className="flex-1 ml-3"><Text className="text-[15px] font-bold" style={{ color: colors.inkPrimary }}>{event.habit.title}</Text><Text className="text-[12px] mt-1" style={{ color: colors.inkSecondary }}>{time}{event.habit.location ? ` · ${event.habit.location}` : ""}</Text></View><View className="items-end"><View className="flex-row items-center rounded-full px-2.5 py-1" style={{ backgroundColor: status === "done" ? colors.successSoft : status === "missed" ? colors.dangerSoft : colors.accentSoft }}><StatusIcon size={12} color={tone} strokeWidth={2.5} /><Text className="text-[11px] font-bold ml-1" style={{ color: tone }}>{label}</Text></View>{status !== "upcoming" && <Text className="text-[10px] mt-2" style={{ color: colors.inkTertiary }}>Tap to update</Text>}</View></View></Pressable>;
};
