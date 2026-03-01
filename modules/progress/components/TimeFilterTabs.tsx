import React from "react";
import { View, Pressable } from "react-native";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/context/SettingsContext";

interface TimeFilterTabsProps {
  selectedTab: "Week" | "Month" | "Year";
  onSelectTab: (tab: "Week" | "Month" | "Year") => void;
}

const TABS: Array<"Week" | "Month" | "Year"> = ["Week", "Month", "Year"];

const TimeFilterTabs: React.FC<TimeFilterTabsProps> = ({
  selectedTab,
  onSelectTab,
}) => {
  const colors = useTheme();
  return (
    <View
      className="flex-row rounded-xl p-1 mb-6"
      style={{ backgroundColor: colors.surface }}>
      {TABS.map((tab) => {
        const isSelected = selectedTab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onSelectTab(tab)}
            className="flex-1 py-2 items-center rounded-lg"
            style={{
              backgroundColor: isSelected ? colors.primary : "transparent",
            }}>
            <ApText
              size="sm"
              font="bold"
              color={isSelected ? colors.background : colors.textMuted}>
              {tab}
            </ApText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default TimeFilterTabs;
