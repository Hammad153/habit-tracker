import React from "react";
import { View, StyleProp, ViewStyle, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
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
  transparent?: boolean;
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
  transparent = false,
}) => {
  return (
    <View
      style={[
        containerStyle,
        {
          overflow: "hidden",
          borderBottomWidth: transparent ? 0 : 1,
          borderBottomColor: ApTheme.Color.surfaceBorder,
        },
      ]}
      className={`w-full ${containerClassName}`}
    >
      {!transparent && hasBackGround && (
        <>
          <BlurView
            intensity={80}
            tint="dark"
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
            ]}
          />
          <LinearGradient
            colors={["rgba(16, 34, 22, 0.8)", "rgba(16, 34, 22, 0.6)"]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </>
      )}

      <View className={`px-5 pt-4 pb-4 ${headerClassName}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            {hasBackButton && (
              <Pressable
                onPress={onBack}
                className={`mr-4 w-10 h-10 items-center justify-center rounded-full border border-white/10 ${backContainerClassName}`}
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                hitSlop={10}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={ApTheme.Color.primary}
                />
              </Pressable>
            )}

            <View className="flex-1">
              {typeof title === "string" ? (
                <ApText
                  font="bold"
                  size="3xl"
                  numberOfLines={1}
                  className={titleClassName}
                  color={ApTheme.Color.white}
                >
                  {title}
                </ApText>
              ) : (
                title
              )}

              {subheader && (
                <View className="mt-1">
                  {typeof subheader === "string" ? (
                    <ApText
                      size="sm"
                      color={ApTheme.Color.primary}
                      font="bold"
                      style={{ letterSpacing: 0.5 }}
                    >
                      {subheader.toUpperCase()}
                    </ApText>
                  ) : (
                    subheader
                  )}
                </View>
              )}
            </View>
          </View>

          <View className="flex-row items-center space-x-3">
            {icons}
            {right}
          </View>
        </View>
      </View>
    </View>
  );
};
