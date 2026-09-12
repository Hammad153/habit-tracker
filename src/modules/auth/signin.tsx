import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import { Text, Pressable, View } from "react-native";
import { ToastService } from "@/src/services";
import { useTheme } from "@/src/modules/settings/context";
import { useAuthState } from "./context";
import { AuthService } from "./api";
import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";
import Button from "@/src/components/buttons/Button";

const SigninScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthState();
  const router = useRouter();
  const colors = useTheme();

  const handleLogin = () => {
    if (!email || !password) {
      ToastService.Error("Please fill in all fields");
      return;
    }

    setLoading(true);
    AuthService.login(email, password)
      .then((data) => {
        return signIn(
          {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          },
          data.user,
        ).then(() => {
          ToastService.Success("Logged in successfully");
          router.replace("/(tabs)");
        });
      })
      .catch((error: any) => {
        ToastService.Error(error.response?.data?.message || "Login failed");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your habits"
      footer={
        <Text className="text-[13.5px] text-ink-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/signup" asChild>
            <Text className="font-bold text-accent">Sign up</Text>
          </Link>
        </Text>
      }
    >
      <AuthInput
        label="Email address"
        icon="mail"
        placeholder="alex@gmail.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <AuthInput
        label="Password"
        icon="lock"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secure
      />

      <View className="items-end mb-6">
        <Link href="/forgot-password" asChild>
          <Pressable>
            <Text className="text-[13px] font-semibold text-ink-secondary">
              Forgot password?
            </Text>
          </Pressable>
        </Link>
      </View>

      <Button
        label="Sign in"
        onPress={handleLogin}
        loading={loading}
        variant="primary"
      />
    </AuthLayout>
  );
};

export default SigninScreen;
