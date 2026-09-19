import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import { Text, Pressable, View } from "react-native";
import { AlertCircle } from "lucide-react-native";
import { ToastService } from "@/src/services";
import { useTheme } from "@/src/modules/settings/context";
import { useAuthState } from "./context";
import { AuthService } from "./api";
import { ApStorageKeys, ApStorageService } from "@/src/services/storage";
import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";
import Button from "@/src/components/buttons/Button";

const SigninScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthState();
  const router = useRouter();
  const colors = useTheme();

  const handleLogin = () => {
    setErrorMessage("");
    if (!email || !password) {
      const msg = "Please enter both your email and password";
      setErrorMessage(msg);
      ToastService.Error(msg);
      return;
    }

    setLoading(true);
    ApStorageService.getRawItemAsync(ApStorageKeys.OnboardingAnonymousId).then((anonymousId) => AuthService.login(email, password, anonymousId ?? undefined))
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
        const raw =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Invalid email or password. Please check your credentials and try again.";
        const msg = Array.isArray(raw) ? raw.join(". ") : String(raw);
        setErrorMessage(msg);
        ToastService.Error(msg);
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
      {errorMessage ? (
        <View
          className="mb-5 p-3.5 rounded-xl flex-row items-center border"
          style={{
            backgroundColor: colors.dangerSoft,
            borderColor: colors.danger,
          }}
        >
          <AlertCircle size={18} color={colors.danger} strokeWidth={2} />
          <Text
            className="flex-1 ml-2.5 text-[13.5px] font-medium leading-[19px]"
            style={{ color: colors.danger }}
          >
            {errorMessage}
          </Text>
        </View>
      ) : null}

      <AuthInput
        label="Email address"
        icon="mail"
        placeholder="alex@gmail.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errorMessage) setErrorMessage("");
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <AuthInput
        label="Password"
        icon="lock"
        placeholder="••••••••"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errorMessage) setErrorMessage("");
        }}
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
