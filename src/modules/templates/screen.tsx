import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ApText,
  ApContainer,
  ApHeader,
  ApScrollView,
  ApLoader,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { useSubscriptionState } from "@/src/modules/subscription/context";
import { SubscriptionTier } from "@/src/modules/subscription/model";
import { ToastService } from "@/src/services";
import { IHabitTemplate } from "./model";
import { TemplateApiService } from "./api";

const CATEGORY_ICONS: Record<string, string> = {
  Fitness: "barbell",
  Mindfulness: "flower",
  Productivity: "rocket",
  Health: "heart",
  Career: "briefcase",
};

const TemplateScreen = () => {
  const { colors } = useSettingsState();
  const { createHabit } = useHabitState();
  const { subscription, setShowUpgradeModal } = useSubscriptionState();
  const [templates, setTemplates] = useState<IHabitTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    TemplateApiService.getAll()
      .then((data) => setTemplates(data || []))
      .catch((err) => ToastService.ApiError(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(templates.map((t) => t.category))];

  const filteredTemplates =
    selectedCategory === "All"
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleUseTemplate = (template: IHabitTemplate) => {
    const userTier = subscription?.tier || SubscriptionTier.FREE;
    const tierOrder = [
      SubscriptionTier.FREE,
      SubscriptionTier.BASIC,
      SubscriptionTier.PREMIUM,
    ];
    const userTierIndex = tierOrder.indexOf(userTier);
    const requiredTierIndex = tierOrder.indexOf(
      template.tier as SubscriptionTier,
    );

    if (requiredTierIndex > userTierIndex) {
      setShowUpgradeModal(true);
      return;
    }

    createHabit({
      title: template.title,
      subtitle: template.subtitle,
      icon: template.icon,
      iconColor: template.iconColor,
      iconBg: template.iconBg,
      category: template.category,
      goal: template.goal,
      unit: template.unit,
    }).then(() => router.back());
  };

  if (loading) return <ApLoader />;

  return (
    <ApContainer>
      <ApHeader title="Habit Templates" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 mb-4"
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className="mr-2 px-4 py-2 rounded-full"
                style={{
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderWidth: isSelected ? 0 : 1,
                  borderColor: colors.surfaceBorder,
                }}
              >
                <View className="flex-row items-center">
                  {category !== "All" && (
                    <Ionicons
                      name={(CATEGORY_ICONS[category] || "grid") as any}
                      size={14}
                      color={isSelected ? "#FFFFFF" : colors.textMuted}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <ApText
                    size="sm"
                    font={isSelected ? "bold" : "medium"}
                    color={isSelected ? "#FFFFFF" : colors.textMuted}
                  >
                    {category}
                  </ApText>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Template cards */}
        <View className="px-5">
          {filteredTemplates.map((template) => {
            const isLocked =
              template.tier !== "FREE" &&
              subscription?.tier === SubscriptionTier.FREE;

            return (
              <TouchableOpacity
                key={template.id}
                onPress={() => handleUseTemplate(template)}
                className="flex-row items-center p-4 mb-3 rounded-2xl border"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.surfaceBorder,
                  opacity: isLocked ? 0.7 : 1,
                }}
              >
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{ backgroundColor: template.iconBg }}
                >
                  <Ionicons
                    name={template.icon as any}
                    size={22}
                    color={template.iconColor}
                  />
                </View>

                <View className="flex-1 ml-3">
                  <View className="flex-row items-center">
                    <ApText
                      size="base"
                      font="semibold"
                      color={colors.textPrimary}
                    >
                      {template.title}
                    </ApText>
                    {template.tier !== "FREE" && (
                      <View
                        className="ml-2 px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor:
                            template.tier === "PREMIUM"
                              ? "#8b5cf620"
                              : "#0ea5e920",
                        }}
                      >
                        <ApText
                          size="xs"
                          font="bold"
                          color={
                            template.tier === "PREMIUM" ? "#8b5cf6" : "#0ea5e9"
                          }
                        >
                          {template.tier === "PREMIUM" ? "PRO" : "BASIC"}
                        </ApText>
                      </View>
                    )}
                  </View>
                  {template.subtitle && (
                    <ApText size="xs" color={colors.textMuted} className="mt-1">
                      {template.subtitle}
                    </ApText>
                  )}
                  <ApText
                    size="xs"
                    color={colors.textSecondary}
                    className="mt-1"
                  >
                    Goal: {template.goal} {template.unit || "times"} •{" "}
                    {template.frequency || "Daily"}
                  </ApText>
                </View>

                <Ionicons
                  name={isLocked ? "lock-closed" : "add-circle"}
                  size={24}
                  color={isLocked ? colors.textMuted : colors.primary}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="h-20" />
      </ApScrollView>
    </ApContainer>
  );
};

export default TemplateScreen;
