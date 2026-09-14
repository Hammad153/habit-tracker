import { View } from 'react-native';
import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import { Text } from "react-native";
import { ToastService } from "@/src/services";
import { useTheme } from "@/src/modules/settings/context";
import { useAuthState } from "./context";
import { AuthService } from "./api";
import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";
import Button from "@/src/components/buttons/Button";

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
      title="Create account"
      subtitle="Join us and start tracking your habits"
      footer={
        <Text className="text-[13.5px] text-ink-secondary">
          Already have an account?{" "}
          <Link href="/login" asChild>
            <Text className="font-bold text-accent">Sign in</Text>
          </Link>
        </Text>
      }
    >
      <AuthInput
        label="Full name"
        icon="user"
        placeholder="Alex Smith"
        value={name}
        onChangeText={setName}
      />

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

      <View className="mt-2">
        <Button
          label="Sign up"
          onPress={handleSignup}
          loading={loading}
          variant="primary"
        />
      </View>
    </AuthLayout>
  );
};

export default SignupScreen;
