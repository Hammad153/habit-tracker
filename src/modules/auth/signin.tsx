import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { ToastService } from "@/src/services";
import { useTheme } from "@/src/modules/settings/context";
import { useAuthState } from "./context";
import { AuthService } from "./api";
import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";

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
      title="Welcome Back"
      subtitle="Sign in to continue your habit journey"
      footer={
        <>
          <Text style={{ color: colors.textSecondary }}>
            Don't have an account?{" "}
          </Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text className="font-bold" style={{ color: colors.primary }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </>
      }
    >
      <AuthInput
        label="Email Address"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <AuthInput
        label="Password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secure
        autoCapitalize="none"
      />

      <Link href="/forgot-password" asChild>
        <TouchableOpacity className="self-end mb-3">
          <Text className="text-sm" style={{ color: colors.primary }}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.85}
        className={`py-4 rounded-xl mt-3 items-center ${loading ? "opacity-70" : ""}`}
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="font-bold text-lg" style={{ color: colors.background }}>
          {loading ? "Signing In..." : "Sign In"}
        </Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default SigninScreen;
