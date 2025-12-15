import React from "react";
import { View, Text } from "react-native";

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
      <Text>
        {days[date.getDay()]}, {months[date.getMonth()]} {date.getDate()}
      </Text>
      <Text className="text-xl font-medium text-primary">
        {motivatingWords[Math.floor(Math.random() * motivatingWords.length)]}
      </Text>

      <View>
        {/* Progress Icon here*/}
      </View>
    </View>
  );
};

export default MotivatingWords;
