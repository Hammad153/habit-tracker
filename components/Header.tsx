import React from "react";
import { View, StyleProp, ViewStyle, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "./Text";
import { ApTheme } from "./theme";

export interface IProps {
  title: React.ReactNode | string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  hasBackButton?: boolean;
  subheader?: React.ReactNode;
  headerClassName?: string;
  titleClassName?: string;
  containerClassName?: string;
  backContainerClassName?: string;
  containerStyle?: StyleProp<ViewStyle>;
  onBack?: () => void;
  hasBackGround?: boolean;
  icons?: React.ReactNode;
}

export const ApHeader: React.FC<IProps> = ({
  title,
  left,
  right,
  icons,
  hasBackButton = false,
  subheader,
  headerClassName,
  titleClassName,
  containerClassName,
  backContainerClassName,
  containerStyle,
  onBack,
  hasBackGround = true,
}) => {
  return (
    <View
      style={[
        containerStyle,
        hasBackGround && { backgroundColor: ApTheme.Color.background },
      ]}
      className={`w-full ${containerClassName}`}
    >
      <View className={`px-4 py-3 mb-2 ${headerClassName}`}>
        <View className="absolute inset-0 items-center justify-center">
          {typeof title === "string" ? (
            <ApText
              font="semibold"
              size="2xl"
              numberOfLines={1}
              className={` ${titleClassName}`}
              color={ApTheme.Color.primary}
            >
              {title}
            </ApText>
          ) : (
            title
          )}
        </View>

        <View className="flex-row items-center justify-between z-10">
          <View className="flex-row items-center space-x-2">
            {hasBackButton && (
              <Pressable
                onPress={onBack}
                className={`rounded-full bg-surface ${backContainerClassName}`}
                hitSlop={10}
              >
                <Ionicons
                  name="arrow-back"
                  size={16}
                  color={ApTheme.Color.primary}
                />
              </Pressable>
            )}
            {left}
          </View>

          <View className="flex-row items-center space-x-2">
            {icons}
            {right}
          </View>
        </View>
      </View>

      {subheader && (
        <View className="px-4 pb-2">
          {typeof subheader === "string" ? (
            <ApText size="sm" color={ApTheme.Color.textMuted}>
              {subheader}
            </ApText>
          ) : (
            subheader
          )}
        </View>
      )}

      <View
        style={{ backgroundColor: ApTheme.Color.border }}
        className="h-[1px] w-full my-2"
      />
    </View>
  );
};
