import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import { ApText } from "./Text";
import { useTheme } from "@/src/context/SettingsContext";

type LoaderVariant = "orbit" | "pulse" | "wave" | "ripple";
type LoaderSize = "small" | "medium" | "large";

interface IProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  label?: string;
  overlay?: boolean;
}

interface ILoaderProps {
  dim: number;
  color: string;
}

const SIZES: Record<LoaderSize, number> = {
  small: 40,
  medium: 64,
  large: 90,
};

const ApLoader: React.FC<IProps> = ({
  variant = "orbit",
  size = "medium",
  label,
  overlay = false,
}) => {
  const colors = useTheme();
  const dim = SIZES[size];
  const color = colors.primary;

  const inner = (
    <View style={styles.wrapper}>
      {variant === "orbit" && <OrbitLoader dim={dim} color={color} />}
      {variant === "pulse" && <PulseLoader dim={dim} color={color} />}
      {variant === "wave" && <WaveLoader dim={dim} color={color} />}
      {variant === "ripple" && <RippleLoader dim={dim} color={color} />}
      {label && (
        <ApText
          size="sm"
          font="semibold"
          color={colors.textMuted}
          style={{ marginTop: 14, letterSpacing: 0.4 }}
        >
          {label}
        </ApText>
      )}
    </View>
  );

  return overlay ? (
    <View
      style={[styles.overlay, { backgroundColor: colors.background + "DD" }]}
    >
      {inner}
    </View>
  ) : (
    inner
  );
};

const OrbitLoader: React.FC<ILoaderProps> = ({ dim, color }) => {
  const spin1 = useRef(new Animated.Value(0)).current;
  const spin2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (anim: Animated.Value, dur: number, toVal = 1) =>
      Animated.loop(
        Animated.timing(anim, {
          toValue: toVal,
          duration: dur,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

    loop(spin1, 1200);
    loop(spin2, 1900, -1);
  }, []);

  const r1 = spin1.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const r2 = spin2.interpolate({
    inputRange: [-1, 0],
    outputRange: ["-360deg", "0deg"],
  });
  const dot = dim * 0.18;

  return (
    <View
      style={{
        width: dim,
        height: dim,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: dim * 0.28,
          height: dim * 0.28,
          borderRadius: dim * 0.14,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 8,
        }}
      />

      <Animated.View
        style={{
          position: "absolute",
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          borderWidth: 1.5,
          borderColor: color + "40",
          transform: [{ rotate: r1 }],
        }}
      >
        <View
          style={{
            position: "absolute",
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            backgroundColor: color,
            top: -dot / 2,
            left: dim / 2 - dot / 2,
            shadowColor: color,
            shadowOpacity: 1,
            shadowRadius: 6,
            elevation: 6,
          }}
        />
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          width: dim * 0.62,
          height: dim * 0.62,
          borderRadius: dim * 0.31,
          borderWidth: 1.5,
          borderColor: color + "60",
          transform: [{ rotate: r2 }],
        }}
      >
        <View
          style={{
            position: "absolute",
            width: dot * 0.7,
            height: dot * 0.7,
            borderRadius: (dot * 0.7) / 2,
            backgroundColor: "#ffffff",
            top: -(dot * 0.7) / 2,
            left: dim * 0.31 - (dot * 0.7) / 2,
            shadowColor: "#fff",
            shadowOpacity: 0.9,
            shadowRadius: 4,
            elevation: 4,
          }}
        />
      </Animated.View>
    </View>
  );
};

const PulseLoader: React.FC<ILoaderProps> = ({ dim, color }) => {
  const anim0 = useRef(new Animated.Value(0)).current;
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anims = [anim0, anim1, anim2];

  useEffect(() => {
    const all = anims.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 320),
          Animated.timing(a, {
            toValue: 1,
            duration: 1100,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(a, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    all.forEach((x) => x.start());
    return () => all.forEach((x) => x.stop());
  }, []);

  return (
    <View
      style={{
        width: dim,
        height: dim,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {anims.map((a, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            borderWidth: 2,
            borderColor: color,
            opacity: a.interpolate({
              inputRange: [0, 1],
              outputRange: [0.85, 0],
            }),
            transform: [
              {
                scale: a.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.15, 1],
                }),
              },
            ],
          }}
        />
      ))}
      <View
        style={{
          width: dim * 0.3,
          height: dim * 0.3,
          borderRadius: dim * 0.15,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.75,
          shadowRadius: 10,
          elevation: 8,
        }}
      />
    </View>
  );
};

const WaveLoader: React.FC<ILoaderProps> = ({ dim, color }) => {
  const bar0 = useRef(new Animated.Value(0.3)).current;
  const bar1 = useRef(new Animated.Value(0.3)).current;
  const bar2 = useRef(new Animated.Value(0.3)).current;
  const bar3 = useRef(new Animated.Value(0.3)).current;
  const bar4 = useRef(new Animated.Value(0.3)).current;
  const bars = [bar0, bar1, bar2, bar3, bar4];

  useEffect(() => {
    const all = bars.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 110),
          Animated.timing(a, {
            toValue: 1,
            duration: 480,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(a, {
            toValue: 0.3,
            duration: 480,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    all.forEach((x) => x.start());
    return () => all.forEach((x) => x.stop());
  }, []);

  const bw = dim * 0.1;

  return (
    <View
      style={{
        width: dim,
        height: dim,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {bars.map((a, i) => (
        <Animated.View
          key={i}
          style={{
            width: bw,
            height: dim * 0.65,
            marginHorizontal: dim * 0.025,
            borderRadius: bw / 2,
            backgroundColor: color,
            transform: [{ scaleY: a }],
            shadowColor: color,
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 4,
          }}
        />
      ))}
    </View>
  );
};

const RippleLoader: React.FC<ILoaderProps> = ({ dim, color }) => {
  const anim0 = useRef(new Animated.Value(0)).current;
  const anim1 = useRef(new Animated.Value(0)).current;
  const anims = [anim0, anim1];

  useEffect(() => {
    const all = anims.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 650),
          Animated.timing(a, {
            toValue: 1,
            duration: 1400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(a, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    all.forEach((x) => x.start());
    return () => all.forEach((x) => x.stop());
  }, []);

  return (
    <View
      style={{
        width: dim,
        height: dim,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {anims.map((a, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: color,
            opacity: a.interpolate({
              inputRange: [0, 0.4, 1],
              outputRange: [0.6, 0.2, 0],
            }),
            transform: [{ scale: a }],
          }}
        />
      ))}
      <View
        style={{
          width: dim * 0.34,
          height: dim * 0.34,
          borderRadius: dim * 0.17,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.85,
          shadowRadius: 14,
          elevation: 10,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", justifyContent: "center", padding: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
});

export default ApLoader;
