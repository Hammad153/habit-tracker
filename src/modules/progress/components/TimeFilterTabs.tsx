import React from "react";
import { View, Pressable } from "react-native";
import { ApText } from "@/src/components/Text";
import { useTheme } from "@/src/modules/settings/context";

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
      className="flex-row rounded-2xl p-1.5 mb-6"
      style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder }}>
      {TABS.map((tab) => {
        const isSelected = selectedTab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onSelectTab(tab)}
            className="flex-1 py-2.5 items-center rounded-xl"
            style={{
              backgroundColor: isSelected ? colors.primary : "transparent",
              shadowColor: isSelected ? colors.primary : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isSelected ? 0.25 : 0,
              shadowRadius: 6,
              elevation: isSelected ? 3 : 0,
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
