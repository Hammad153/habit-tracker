import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { ApText } from "@/components/Text";

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
      <View className="flex flex-row w-full justify-between items-center mb-2">
        <ApText className="text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
          {days[date.getDay()]},{" "}
          <ApText className="text-primary">
            {months[date.getMonth()]} {date.getDate()}
          </ApText>
        </ApText>

        <View>
          <View className="relative size-14 flex items-center justify-center">
            <Svg className="size-full -rotate-90" viewBox="0 0 36 36">
              <Path
                //className="text-slate-200 dark:text-[#23482f]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              ></Path>
              <Path
                //className="text-primary"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="40, 100"
                strokeLinecap="round"
                strokeWidth="4"
              ></Path>
            </Svg>
            <ApText className="absolute text-xs font-bold text-slate-900 dark:text-white">
              40%
            </ApText>
          </View>
        </View>
      </View>

      <ApText className="text-xl font-medium text-primary">
        {motivatingWords[Math.floor(Math.random() * motivatingWords.length)]}
      </ApText>
    </View>
  );
};

export default MotivatingWords;
