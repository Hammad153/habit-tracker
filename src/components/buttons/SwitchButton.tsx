import React, { useRef, useEffect } from "react";
import { View, Pressable, Animated, StyleSheet } from "react-native";
import { useTheme } from "@/src/context/SettingsContext";

interface ToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
}

const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 22;
const TRACK_PADDING = 3;

const ToggleButton = ({ isEnabled, onToggle }: ToggleProps) => {
  const colors = useTheme();
  const translateX = useRef(
    new Animated.Value(
      isEnabled ? TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2 : 0,
    ),
  ).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: isEnabled ? TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2 : 0,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, [isEnabled]);

  return (
    <Pressable onPress={onToggle}>
      <View
        style={[
          styles.track,
          {
            backgroundColor: isEnabled
              ? colors.primary
              : colors.surfaceInactive,
          },
        ]}>
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX }],
              backgroundColor: colors.background,
            },
          ]}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: TRACK_PADDING,
    justifyContent: "center",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default ToggleButton;
