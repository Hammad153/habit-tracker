import React, { useMemo, useState } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { ToastService } from "@/src/services";
import { useTheme } from "@/src/modules/settings/context";
import { AuthService } from "./api";
import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";

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
      title="Reset Password"
      subtitle={
        token
          ? "Create a new password for your account"
          : "This reset link is missing a token"
      }
      footer={
        <>
          <Text style={{ color: colors.textSecondary }}>Need a new link? </Text>
          <Link href="/forgot-password" asChild>
            <TouchableOpacity>
              <Text className="font-bold" style={{ color: colors.primary }}>
                Request Reset
              </Text>
            </TouchableOpacity>
          </Link>
        </>
      }
    >
      <AuthInput
        label="New Password"
        icon="lock-closed-outline"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Create a new password"
        autoCapitalize="none"
        autoComplete="new-password"
        secure
      />

      <AuthInput
        label="Confirm Password"
        icon="lock-closed-outline"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm your new password"
        autoCapitalize="none"
        autoComplete="new-password"
        secure
      />

      <TouchableOpacity
        onPress={handleResetPassword}
        disabled={loading || !token}
        activeOpacity={0.85}
        className={`py-4 rounded-xl mt-3 items-center ${
          loading || !token ? "opacity-70" : ""
        }`}
        style={{ backgroundColor: colors.primary }}
      >
        <Text
          className="font-bold text-lg"
          style={{ color: colors.background }}
        >
          {loading ? "Updating..." : "Update Password"}
        </Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default ResetPasswordScreen;
