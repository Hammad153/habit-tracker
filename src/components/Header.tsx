import React from "react";
import { View, StyleProp, ViewStyle, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Appbar } from "react-native-paper";
import { ApText } from "./Text";
import { useTheme } from "@/src/modules/settings/context";

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
  const colors = useTheme();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        containerStyle,
        {
          overflow: "hidden",
          borderBottomWidth: transparent ? 0 : 1,
          borderBottomColor: colors.surfaceBorder,
        },
      ]}
      className={`w-full ${containerClassName}`}
    >
      {!transparent && hasBackGround && (
        <>
          <BlurView
            intensity={80}
            tint={colors.isDark ? "dark" : "light"}
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
            colors={
              colors.isDark
                ? ["rgba(16, 34, 22, 0.8)", "rgba(16, 34, 22, 0.6)"]
                : ["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.6)"]
            }
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

      <Appbar.Header
        style={{ backgroundColor: "transparent", elevation: 0 }}
        className={`px-2 ${headerClassName}`}
      >
        <View className="flex-row items-center" style={{ width: 60 }}>
          {hasBackButton && (
            <Appbar.BackAction
              onPress={handleBack}
              color={colors.primary}
              className={`${backContainerClassName}`}
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            />
          )}
          {left}
        </View>

        <Appbar.Content
          title={
            typeof title === "string" ? (
              <ApText
                font="bold"
                size="2xl"
                numberOfLines={1}
                className={titleClassName}
                color={colors.textPrimary}
              >
                {title}
              </ApText>
            ) : (
              title
            )
          }
          subtitle={
            subheader ? (
              typeof subheader === "string" ? (
                <ApText
                  size="sm"
                  color={colors.primary}
                  font="bold"
                  style={{ letterSpacing: 0.5 }}
                >
                  {subheader.toUpperCase()}
                </ApText>
              ) : (
                subheader
              )
            ) : undefined
          }
          style={{ alignItems: "center" }}
        />

        <View
          className="flex-row items-center justify-end"
          style={{ width: 60 }}
        >
          {icons}
          {right}
        </View>
      </Appbar.Header>
    </View>
  );
};
