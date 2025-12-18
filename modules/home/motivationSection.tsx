import React from "react";
import { View } from "react-native";
import { ApText } from "@/components/Text";
import { ApTheme } from "@/components/theme";

const MotivatingWords = () => {
  const date = new Date();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

  const motivatingWords = [
    "Keep up the good work!",
    "Today will be beter than yesterday",
    "You only stop learning when you die",
  ];

  return (
    <View className="my-2">
      <ApText>
        {days[date.getDay()]}, {months[date.getMonth()]} {date.getDate()}
      </ApText>
      <ApText size="xl" font="medium" color={ApTheme.Color.primary}>
        {motivatingWords[Math.floor(Math.random() * motivatingWords.length)]}
      </ApText>

      <View>{/* Progress Icon here*/}</View>
    </View>
  );
};

export default MotivatingWords;
