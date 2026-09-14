import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import {
  ArrowLeft,
  Plus,
  Flame,
  FileText,
  Sparkles,
  X,
} from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApContainer, SkeletonHabitList } from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { IHabitTemplate } from "./model";
import { TemplateApiService } from "./api";

const DEFAULT_TEMPLATES: IHabitTemplate[] = [
  {
    id: "tpl-water",
    title: "Morning Hydration",
    subtitle: "Drink a full glass of water upon waking",
    icon: "water",
    iconColor: "#0ea5e9",
    iconBg: "rgba(14, 165, 233, 0.15)",
    category: "Health",
    frequency: "Daily",
    goal: 2000,
    unit: "ml",
    tier: "FREE",
    sortOrder: 1,
  },
  {
    id: "tpl-pushups",
    title: "Daily Push-Ups",
    subtitle: "Build core and upper body strength",
    icon: "barbell",
    iconColor: "#f43f5e",
    iconBg: "rgba(244, 63, 94, 0.15)",
    category: "Fitness",
    frequency: "Daily",
    goal: 30,
    unit: "reps",
    tier: "FREE",
    sortOrder: 2,
  },
  {
    id: "tpl-walk",
    title: "10,000 Steps Walk",
    subtitle: "Keep active with daily movement",
    icon: "walk",
    iconColor: "#10b981",
    iconBg: "rgba(16, 185, 129, 0.15)",
    category: "Fitness",
    frequency: "Daily",
    goal: 10000,
    unit: "steps",
    tier: "FREE",
    sortOrder: 3,
  },
  {
    id: "tpl-meditate",
    title: "Mindful Meditation",
    subtitle: "Clear your head and breathe deeply",
    icon: "flower",
    iconColor: "#8b5cf6",
    iconBg: "rgba(139, 92, 246, 0.15)",
    category: "Mindfulness",
    frequency: "Daily",
    goal: 10,
    unit: "minutes",
    tier: "FREE",
    sortOrder: 4,
  },
  {
    id: "tpl-read",
    title: "Read Non-Fiction",
    subtitle: "Expand knowledge page by page",
    icon: "book",
    iconColor: "#f59e0b",
    iconBg: "rgba(245, 158, 11, 0.15)",
    category: "Productivity",
    frequency: "Daily",
    goal: 20,
    unit: "pages",
    tier: "FREE",
    sortOrder: 5,
  },
  {
    id: "tpl-sleep",
    title: "Sleep 8 Hours",
    subtitle: "Prioritize nightly rest and recovery",
    icon: "bed",
    iconColor: "#6366f1",
    iconBg: "rgba(99, 102, 241, 0.15)",
    category: "Health",
    frequency: "Daily",
    goal: 8,
    unit: "hours",
    tier: "FREE",
    sortOrder: 6,
  },
  {
    id: "tpl-journal",
    title: "Evening Journaling",
    subtitle: "Reflect on accomplishments and learnings",
    icon: "create",
    iconColor: "#ec4899",
    iconBg: "rgba(236, 72, 153, 0.15)",
    category: "Mindfulness",
    frequency: "Daily",
    goal: 1,
    unit: "entry",
    tier: "FREE",
    sortOrder: 7,
  },
  {
    id: "tpl-eat-healthy",
    title: "Cook a Healthy Meal",
    subtitle: "Wholesome home-cooked nutrition",
    icon: "restaurant",
    iconColor: "#10b981",
    iconBg: "rgba(16, 185, 129, 0.15)",
    category: "Health",
    frequency: "Daily",
    goal: 1,
    unit: "meal",
    tier: "FREE",
    sortOrder: 8,
  },
];

const TemplateScreen: React.FC = () => {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const [templates, setTemplates] = useState<IHabitTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    TemplateApiService.getAll()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setTemplates(data);
        } else {
          setTemplates(DEFAULT_TEMPLATES);
        }
      })
      .catch(() => {
        setTemplates(DEFAULT_TEMPLATES);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const raw = templates.map((t) => t.category).filter(Boolean);
    return ["All", ...Array.from(new Set(raw))];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchCategory =
        selectedCategory === "All" || tpl.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tpl.subtitle &&
          tpl.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tpl.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  const handleUseTemplate = (template: IHabitTemplate) => {
    router.push({
      pathname: "/create-habit",
      params: { template: JSON.stringify(template) },
    });
  };

  const handleCustomHabit = () => {
    router.push({
      pathname: "/create-habit",
      params: searchQuery.trim() ? { title: searchQuery.trim() } : undefined,
    });
  };

  const handleAiSuggest = () => {
    if (filteredTemplates.length > 0) {
      const randomTpl =
        filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)];
      handleUseTemplate(randomTpl);
    } else {
      handleCustomHabit();
    }
  };

  return (
    <ApContainer>
      {/* ── Top Header matching reference ── */}
      <View
        className="flex-row items-center justify-between px-4 pb-2"
        style={{ paddingTop: Math.max(insets.top, 12) }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          className="w-10 h-10 items-center justify-center rounded-full active:opacity-70"
          style={{ backgroundColor: colors.surface }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color={colors.inkPrimary} strokeWidth={2.4} />
        </TouchableOpacity>

        <Text
          className="text-[17px] font-bold tracking-tight text-center"
          style={{ color: colors.inkPrimary }}
        >
          Habit templates
        </Text>

        <View className="w-10" />
      </View>

      {/* ── Horizontal Category Tabs with Underline Indicator ── */}
      <View
        className="border-b mb-3"
        style={{ borderBottomColor: colors.border }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className="py-1"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className="mr-6 py-2 items-center"
              >
                <Text
                  className={`text-[15px] ${
                    isSelected ? "font-bold" : "font-medium"
                  }`}
                  style={{
                    color: isSelected ? colors.inkPrimary : colors.inkTertiary,
                  }}
                >
                  {cat}
                </Text>
                {isSelected && (
                  <View
                    className="w-full h-[2.5px] rounded-full mt-2"
                    style={{ backgroundColor: colors.inkPrimary }}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 90,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Search / Prompt Input Box matching reference design ── */}
        <View
          className="rounded-2xl border-[1.5px] p-3.5 mt-1"
          style={{
            borderColor: colors.inkPrimary,
            backgroundColor: colors.surfaceElevated || colors.backgroundElevated,
          }}
        >
          <Text
            className="text-[11.5px] font-medium mb-1"
            style={{ color: colors.inkTertiary }}
          >
            Describe what you want to build
          </Text>
          <View className="flex-row items-center justify-between">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="e.g. rice, run 5km, read 20 pages..."
              placeholderTextColor={colors.inkDisabled || colors.inkTertiary}
              className="text-[16px] font-semibold flex-1 py-0.5"
              style={{ color: colors.inkPrimary }}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                hitSlop={8}
                className="w-6 h-6 rounded-full items-center justify-center ml-2"
                style={{ backgroundColor: colors.surface }}
              >
                <X size={13} color={colors.inkSecondary} strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Suggestions Section Header ── */}
        <Text
          className="text-[18px] font-bold mt-5 mb-3"
          style={{ color: colors.inkPrimary }}
        >
          Suggestions
        </Text>

        {/* ── Cards List ── */}
        {loading ? (
          <SkeletonHabitList count={6} />
        ) : filteredTemplates.length === 0 ? (
          <View
            className="py-12 items-center justify-center rounded-2xl border border-dashed px-4"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Text
              className="text-[15px] font-semibold text-center mb-1"
              style={{ color: colors.inkPrimary }}
            >
              No template matches &quot;{searchQuery}&quot;
            </Text>
            <Text
              className="text-[13px] text-center mb-4"
              style={{ color: colors.inkTertiary }}
            >
              Tap &quot;Manual Add&quot; below to create this as a custom habit.
            </Text>
            <TouchableOpacity
              onPress={handleCustomHabit}
              className="px-4 py-2.5 rounded-full"
              style={{ backgroundColor: colors.inkPrimary }}
            >
              <Text
                className="text-[13px] font-semibold"
                style={{ color: colors.inkInverse }}
              >
                Create &quot;{searchQuery}&quot;
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredTemplates.map((template) => {
            const metaGoal = `${template.goal} ${template.unit || "times"}`;
            const metaSubtitle = template.subtitle
              ? `${template.subtitle} · ${metaGoal}`
              : `${template.frequency || "Daily"} · ${metaGoal} · ${template.category}`;

            return (
              <Pressable
                key={template.id}
                onPress={() => handleUseTemplate(template)}
                className="rounded-2xl p-4 mb-2.5 flex-row items-center justify-between active:opacity-85 border"
                style={{
                  backgroundColor:
                    colors.surfaceElevated || colors.backgroundElevated,
                  borderColor: colors.border,
                }}
              >
                <View className="flex-1 pr-3">
                  <Text
                    className="text-[16px] font-bold tracking-tight mb-1"
                    style={{ color: colors.inkPrimary }}
                  >
                    {template.title}
                  </Text>
                  <View className="flex-row items-center">
                    <Flame
                      size={13}
                      color={colors.inkTertiary}
                      strokeWidth={2.4}
                    />
                    <Text
                      className="text-[12.5px] ml-1.5"
                      numberOfLines={1}
                      style={{ color: colors.inkTertiary }}
                    >
                      {metaSubtitle}
                    </Text>
                  </View>
                </View>

                {/* Right Plus Button */}
                <View
                  className="w-9 h-9 rounded-full items-center justify-center border"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <Plus
                    size={18}
                    color={colors.inkPrimary}
                    strokeWidth={2.4}
                  />
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* ── Fixed Bottom Sticky Action Bar matching reference ── */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t px-4 pt-3 flex-row gap-3"
        style={{
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 14),
          ...(Platform.OS === "web" ? { maxWidth: 640, alignSelf: "center", width: "100%" } : {}),
        }}
      >
        <TouchableOpacity
          onPress={handleCustomHabit}
          className="flex-1 h-[46px] rounded-full border items-center justify-center flex-row gap-2 active:opacity-80"
          style={{
            borderColor: colors.borderStrong || colors.border,
            backgroundColor: colors.surfaceElevated || colors.backgroundElevated,
          }}
        >
          <FileText size={16} color={colors.inkPrimary} strokeWidth={2} />
          <Text
            className="text-[14px] font-semibold"
            style={{ color: colors.inkPrimary }}
          >
            Manual Add
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAiSuggest}
          className="flex-1 h-[46px] rounded-full border items-center justify-center flex-row gap-2 active:opacity-80"
          style={{
            borderColor: colors.borderStrong || colors.border,
            backgroundColor: colors.surfaceElevated || colors.backgroundElevated,
          }}
        >
          <Sparkles size={16} color={colors.accent} strokeWidth={2} />
          <Text
            className="text-[14px] font-semibold"
            style={{ color: colors.inkPrimary }}
          >
            AI Suggest
          </Text>
        </TouchableOpacity>
      </View>
    </ApContainer>
  );
};

export default TemplateScreen;
