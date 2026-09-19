import { View, Text } from 'react-native';
import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import { ToastService } from "@/src/services";
import { useTheme } from "@/src/modules/settings/context";
import { useAuthState } from "./context";
import { AuthService } from "./api";
import { ApStorageKeys, ApStorageService } from "@/src/services/storage";
import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";
import Button from "@/src/components/buttons/Button";

const SignupScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthState();
  const router = useRouter();
  const colors = useTheme();

  const handleSignup = () => {
    setErrorMessage("");
    if (!name || !email || !password) {
      const msg = "Please fill in all fields";
      setErrorMessage(msg);
      ToastService.Error(msg);
      return;
    }

    setLoading(true);
    ApStorageService.getRawItemAsync(ApStorageKeys.OnboardingAnonymousId).then((anonymousId) => AuthService.signup({ name, email, password, anonymousId: anonymousId ?? undefined }))
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
        const raw =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Signup failed. Please try again.";
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
        label="Full name"
        icon="user"
        placeholder="Alex Smith"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (errorMessage) setErrorMessage("");
        }}
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
