import React, { useState } from "react";
import { View, Pressable, Text } from "react-native";
import { ChevronRight, RotateCcw } from "lucide-react-native";
import { router } from "expo-router";
import { ListRow } from "@/src/components/ListRow";
import { Checkbox } from "@/src/components/Checkbox";
import { ApConfirmModal } from "@/src/components/ConfirmModal";
import { useTheme } from "@/src/modules/settings/context";
import { useFeedback } from "@/src/utils/feedback";
import LogValueModal from "./LogValueModal";
import { useHabitState } from "@/src/modules/habits/context";
import { getLucideIcon, getCategoryKeyForId } from "@/src/utils/icons";
import { CategoryKey } from "@/src/components/ListRow";

export interface HabitCardProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  iconBg?: string;
  customIconNode?: React.ReactNode;
  variant?: "toggle" | "edit" | "restore";
  isCompleted?: boolean;
  onRefresh?: () => void;
  selectedDate: string;
  goal?: number;
  value?: number;
  unit?: string;
  fullBehavior?: string | null;
  minimumBehavior?: string | null;
  emergencyMinimum?: string | null;
  stackAfterTitle?: string | null;
  isLast?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  id,
  title,
  subtitle,
  description,
  icon,
  variant = "toggle",
  isCompleted = false,
  selectedDate,
  goal = 1,
  value = 0,
  unit = "times",
  stackAfterTitle,
  isLast = false,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { toggleHabit, updateHabit, deleteHabit } = useHabitState();
  const colors = useTheme();
  const { triggerHaptic } = useFeedback();

  const handleToggle = () => {
    triggerHaptic();
    if (goal > 1) {
      setModalVisible(true);
    } else {
      toggleHabit(id, selectedDate);
    }
  };

  const handlePress = () => {
    if (variant === "edit") {
      router.push({
        pathname: "/edit-habit",
        params: { habitId: id },
      });
    } else if (variant === "toggle") {
      router.push({
        pathname: "/habit-detail",
        params: { habitId: id },
      });
    }
  };

  const IconComponent = getLucideIcon(icon);
  const categoryKey: CategoryKey = getCategoryKeyForId(id);

  // Determine sublabel
  let subLabel = subtitle || description;
  if (!subLabel) {
    if (goal > 1) {
      subLabel = `${value} of ${goal} ${unit}`;
    } else if (stackAfterTitle) {
      subLabel = `After ${stackAfterTitle}`;
    } else {
      subLabel = "Every day";
    }
  }

  let trailingControl = null;
  if (variant === "toggle") {
    trailingControl = (
      <Checkbox checked={isCompleted} onPress={handleToggle} />
    );
  } else if (variant === "edit") {
    trailingControl = (
      <ChevronRight size={20} color={colors.inkTertiary} strokeWidth={2} />
    );
  } else if (variant === "restore") {
    trailingControl = (
      <Pressable
        onPress={() => updateHabit(id, { isArchived: false })}
        className="w-8 h-8 rounded-pill bg-background-surface items-center justify-center"
      >
        <RotateCcw size={16} color={colors.accent} strokeWidth={2} />
      </Pressable>
    );
  }

  return (
    <>
      <ListRow
        title={title}
        subLabel={subLabel}
        icon={IconComponent}
        categoryKey={categoryKey}
        trailingControl={trailingControl}
        onPress={handlePress}
        isLast={isLast}
        isCompleted={isCompleted}
      />

      {goal > 1 && (
        <LogValueModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          habitId={id}
          habitTitle={title}
          goal={goal}
          currentValue={value}
          unit={unit}
          selectedDate={selectedDate}
        />
      )}

      <ApConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => deleteHabit(id)}
        title="Delete Habit"
        description="Are you sure you want to delete this habit? This action cannot be undone."
        confirmText="Delete"
        isDestructive
      />
    </>
  );
};

export default HabitCard;
