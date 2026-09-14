import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, View, ViewProps, ViewStyle } from "react-native";
import { useTheme } from "@/src/modules/settings/context";

export interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  borderRadius?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  radius = 12,
  borderRadius,
  className = "",
  style,
  ...props
}) => {
  const colors = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;
  const effectiveRadius = borderRadius ?? radius;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius: effectiveRadius,
          opacity,
          backgroundColor: colors.surface2 || colors.backgroundSurface2 || colors.surfaceBorder,
        },
        style,
      ]}
      className={className}
      {...props}
    />
  );
};

export const SkeletonCircle: React.FC<{ size?: number; className?: string; style?: StyleProp<ViewStyle> }> = ({
  size = 40,
  className = "",
  style,
}) => {
  return <Skeleton width={size} height={size} radius={size / 2} className={className} style={style} />;
};

export const SkeletonCard: React.FC<{
  height?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}> = ({ height = 96, className = "", style, children }) => {
  const colors = useTheme();
  return (
    <View
      className={`rounded-lg p-4 ${className}`}
      style={[
        {
          backgroundColor: colors.surface || colors.backgroundSurface,
          borderWidth: 1,
          borderColor: colors.surfaceBorder || colors.border,
        },
        style,
      ]}
    >
      {children || <Skeleton height={height - 32} radius={8} />}
    </View>
  );
};

export const SkeletonHabitRow: React.FC = () => {
  return (
    <View className="flex-row items-center py-3">
      {/* Icon */}
      <Skeleton width={40} height={40} radius={10} />
      {/* Titles */}
      <View className="flex-1 ml-3 mr-2">
        <Skeleton width="65%" height={14} radius={4} className="mb-1.5" />
        <Skeleton width="40%" height={10} radius={4} />
      </View>
      {/* Right button/checkbox */}
      <Skeleton width={32} height={32} radius={16} />
    </View>
  );
};

export const SkeletonHabitList: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className = "",
}) => {
  const colors = useTheme();
  return (
    <View
      className={`rounded-lg px-4 py-1 ${className}`}
      style={{
        backgroundColor: colors.surface || colors.backgroundSurface,
        borderWidth: 1,
        borderColor: colors.surfaceBorder || colors.border,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{
            borderTopWidth: index > 0 ? 1 : 0,
            borderTopColor: colors.surfaceBorder || colors.border,
          }}
        >
          <SkeletonHabitRow />
        </View>
      ))}
    </View>
  );
};

export const SkeletonStatRow: React.FC<{ className?: string }> = ({ className = "" }) => {
  const colors = useTheme();
  return (
    <View className={`flex-row items-center justify-between py-4 ${className}`}>
      <View className="items-center flex-1">
        <Skeleton width={48} height={26} radius={6} className="mb-2" />
        <Skeleton width={64} height={10} radius={4} />
      </View>
      <View
        className="w-[1px] h-8 self-center"
        style={{ backgroundColor: colors.surfaceBorder || colors.border }}
      />
      <View className="items-center flex-1">
        <Skeleton width={48} height={26} radius={6} className="mb-2" />
        <Skeleton width={64} height={10} radius={4} />
      </View>
      <View
        className="w-[1px] h-8 self-center"
        style={{ backgroundColor: colors.surfaceBorder || colors.border }}
      />
      <View className="items-center flex-1">
        <Skeleton width={48} height={26} radius={6} className="mb-2" />
        <Skeleton width={64} height={10} radius={4} />
      </View>
    </View>
  );
};

export const SkeletonBadgeGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  const colors = useTheme();
  return (
    <View className="flex-row flex-wrap justify-between">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            width: "31%",
            height: 100,
            borderRadius: 16,
            backgroundColor: colors.surface || colors.backgroundSurface,
            borderWidth: 1,
            borderColor: colors.surfaceBorder || colors.border,
            padding: 12,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Skeleton width={38} height={38} radius={19} className="mb-2" />
          <Skeleton width={48} height={10} radius={4} />
        </View>
      ))}
    </View>
  );
};

export default Skeleton;
