import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import {
  Dumbbell,
  Flower2,
  Rocket,
  Heart,
  Briefcase,
  Grid,
  Plus,
} from "lucide-react-native";
import { router } from "expo-router";
import {
  ApText,
  ApContainer,
  ApHeader,
  ApScrollView,
  ListRow,
  SkeletonHabitList,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { ToastService } from "@/src/services";
import { IHabitTemplate } from "./model";
import { TemplateApiService } from "./api";
import { getHabitLucideIcon } from "@/src/utils/icons";

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Fitness":
      return Dumbbell;
    case "Mindfulness":
      return Flower2;
    case "Productivity":
      return Rocket;
    case "Health":
      return Heart;
    case "Career":
      return Briefcase;
    default:
      return Grid;
  }
};

const TemplateScreen = () => {
  const { colors } = useSettingsState();
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
    router.push({
      pathname: "/create-habit",
      params: { template: JSON.stringify(template) },
    });
  };

  return (
    <ApContainer>
      <ApHeader title="Habit Templates" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            const CatIcon = getCategoryIcon(category);
            return (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className="mr-2 px-3 py-1.5 rounded-full flex-row items-center"
                style={{
                  backgroundColor: isSelected ? colors.primary : colors.surface2,
                }}
              >
                {category !== "All" && (
                  <CatIcon
                    size={13}
                    color={isSelected ? colors.background : colors.textMuted}
                    style={{ marginRight: 4 }}
                  />
                )}
                <ApText
                  size="xs"
                  font={isSelected ? "semibold" : "normal"}
                  color={isSelected ? colors.background : colors.textMuted}
                >
                  {category}
                </ApText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Template cards */}
        <View>
          {loading ? (
            <SkeletonHabitList count={5} />
          ) : (
            filteredTemplates.map((template) => {
              const IconComp = getHabitLucideIcon(template.title);
              return (
                <View key={template.id} className="mb-2">
                  <ListRow
                    left={
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center"
                        style={{ backgroundColor: colors.accentLight }}
                      >
                      <IconComp size={18} color={colors.primary} />
                    </View>
                  }
                  title={template.title}
                  subtitle={`${template.subtitle || ""}${template.subtitle ? " · " : ""}Goal: ${template.goal} ${template.unit || "times"}`}
                  right={
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center self-center"
                      style={{ backgroundColor: colors.accentLight }}
                    >
                      <Plus size={14} color={colors.primary} />
                    </View>
                  }
                  onPress={() => handleUseTemplate(template)}
                />
              </View>
            );
          })
          )}
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default TemplateScreen;
