import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { ToastService } from "@/src/services";
import { useTheme } from "@/src/modules/settings/context";
import { useAuthState } from "./context";
import { AuthService } from "./api";
import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";

const SignupScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthState();
  const router = useRouter();
  const colors = useTheme();

  const handleSignup = () => {
    if (!name || !email || !password) {
      ToastService.Error("Please fill in all fields");
      return;
    }

    setLoading(true);
    AuthService.signup({ name, email, password })
      .then((data) => {
        return signIn(
          {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          },
          data.user,
        ).then(() => {
          ToastService.Success("Account created successfully");
          router.replace("/(tabs)");
        });
      })
      .catch((error: any) => {
        ToastService.Error(error.response?.data?.message || "Signup failed");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join us and start tracking your habits"
      footer={
        <>
          <Text style={{ color: colors.textSecondary }}>
            Already have an account?{" "}
          </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text className="font-bold" style={{ color: colors.primary }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </>
      }
    >
      <AuthInput
        label="Full Name"
        icon="person-outline"
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        autoComplete="name"
      />

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
        placeholder="Create a password"
        secure
        autoCapitalize="none"
      />

      <TouchableOpacity
        onPress={handleSignup}
        disabled={loading}
        activeOpacity={0.85}
        className={`py-4 rounded-xl mt-3 items-center ${loading ? "opacity-70" : ""}`}
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="font-bold text-lg" style={{ color: colors.background }}>
          {loading ? "Creating Account..." : "Create Account"}
        </Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default SignupScreen;
