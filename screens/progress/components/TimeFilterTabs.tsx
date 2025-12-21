import React from "react";
import { View, Pressable } from "react-native";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";

interface TimeFilterTabsProps {
  selectedTab: "Week" | "Month" | "Year";
  onSelectTab: (tab: "Week" | "Month" | "Year") => void;
}

const TABS: Array<"Week" | "Month" | "Year"> = ["Week", "Month", "Year"];

const TimeFilterTabs: React.FC<TimeFilterTabsProps> = ({
  selectedTab,
  onSelectTab,
}) => {
  return (
    <View
      className="flex-row rounded-xl p-1 mb-6"
      style={{ backgroundColor: ApTheme.Color.surface }}
    >
      {TABS.map((tab) => {
        const isSelected = selectedTab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onSelectTab(tab)}
            className="flex-1 py-2 items-center rounded-lg"
            style={{
              backgroundColor: isSelected
                ? ApTheme.Color.primary
                : "transparent",
            }}
          >
            <ApText
              size="sm"
              font="bold"
              color={isSelected ? "black" : ApTheme.Color.textMuted}
            >
              {tab}
            </ApText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default TimeFilterTabs;
