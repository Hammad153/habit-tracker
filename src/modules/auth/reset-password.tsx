import React, { useMemo, useState } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { ToastService } from "@/src/services";
import { useTheme } from "@/src/modules/settings/context";
import { AuthService } from "./api";
import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";
import Button from "@/src/components/buttons/Button";

const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const ResetPasswordScreen = () => {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = useMemo(
    () => getParam(params.token)?.trim() ?? "",
    [params.token],
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const colors = useTheme();

  const handleResetPassword = () => {
    if (!token) {
      ToastService.Error("Reset link is invalid. Please request a new link.");
      return;
    }

    if (newPassword.length < 8) {
      ToastService.Error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      ToastService.Error("Passwords do not match");
      return;
    }

    setLoading(true);
    AuthService.resetPassword({ token, newPassword })
      .then(() => {
        ToastService.Success("Password reset successfully. Please sign in.");
        router.replace("/login");
      })
      .catch((error: any) => {
        ToastService.Error(
          error.response?.data?.message ||
            "Reset link is invalid or has expired. Please request a new link.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Choose a new secure password"
      footer={
        <Text className="text-[13.5px] text-ink-secondary">
          Remember your password?{" "}
          <Link href="/login" asChild>
            <Text className="font-bold text-accent">Sign in</Text>
          </Link>
        </Text>
      }
    >
      <AuthInput
        label="New password"
        icon="lock"
        placeholder="••••••••"
        value={newPassword}
        onChangeText={setNewPassword}
        secure
      />

      <AuthInput
        label="Confirm password"
        icon="lock"
        placeholder="••••••••"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secure
      />

      <View className="mt-2">
        <Button
          label="Save new password"
          onPress={handleResetPassword}
          loading={loading}
          variant="primary"
        />
      </View>
    </AuthLayout>
  );
};

export default ResetPasswordScreen;
