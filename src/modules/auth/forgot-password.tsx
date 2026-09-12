import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import { Text, View } from "react-native";
import { ToastService } from "@/src/services";
import { useTheme } from "@/src/modules/settings/context";
import { AuthService } from "./api";
import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";
import Button from "@/src/components/buttons/Button";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const colors = useTheme();

  const handleResetPassword = () => {
    if (!email) {
      ToastService.Error("Please enter your email address");
      return;
    }

    setLoading(true);
    AuthService.forgotPassword(email)
      .then(() => {
        setEmailSent(true);
        ToastService.Success("Password reset email sent! Check your inbox.");
      })
      .catch((error: any) => {
        ToastService.Error(
          error.response?.data?.message || "Failed to send reset email",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (emailSent) {
    return (
      <AuthLayout
        title="Email sent"
        subtitle="Check your inbox for password reset instructions"
        footer={
          <Text className="text-[13.5px] text-ink-secondary">
            Remember your password?{" "}
            <Link href="/login" asChild>
              <Text className="font-bold text-accent">Back to sign in</Text>
            </Link>
          </Text>
        }
      >
        <Button
          label="Resend email"
          onPress={handleResetPassword}
          loading={loading}
          variant="secondary"
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email to receive reset instructions"
      footer={
        <Text className="text-[13.5px] text-ink-secondary">
          Remember your password?{" "}
          <Link href="/login" asChild>
            <Text className="font-bold text-accent">Back to sign in</Text>
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

      <View className="mt-2">
        <Button
          label="Send reset instructions"
          onPress={handleResetPassword}
          loading={loading}
          variant="primary"
        />
      </View>
    </AuthLayout>
  );
};

export default ForgotPasswordScreen;
