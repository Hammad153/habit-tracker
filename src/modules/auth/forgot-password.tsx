import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { ToastService } from "@/src/services";
import { useTheme } from "@/src/modules/settings/context";
import { AuthService } from "./api";
import AuthLayout from "./components/AuthLayout";
import AuthInput from "./components/AuthInput";

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
        title="Email Sent!"
        subtitle="Check your inbox for password reset instructions"
        footer={
          <>
            <Text style={{ color: colors.textSecondary }}>
              Remember your password?{" "}
            </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text className="font-bold" style={{ color: colors.primary }}>
                  Back to Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </>
        }
      >
        <View className="items-center py-8">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <Text style={{ fontSize: 40 }}>📧</Text>
          </View>
          <Text
            className="text-center mt-4"
            style={{ color: colors.textSecondary }}
          >
            We've sent password reset instructions to{" "}
            <Text className="font-bold" style={{ color: colors.textPrimary }}>
              {email}
            </Text>
          </Text>
          <Text
            className="text-center mt-4"
            style={{ color: colors.textSecondary }}
          >
            If you don't see the email, check your spam folder.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setEmailSent(false)}
          activeOpacity={0.85}
          className="py-4 rounded-xl mt-4 items-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="font-bold text-lg"
            style={{ color: colors.background }}
          >
            Resend Email
          </Text>
        </TouchableOpacity>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to reset your password"
      footer={
        <>
          <Text style={{ color: colors.textSecondary }}>
            Remember your password?{" "}
          </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text className="font-bold" style={{ color: colors.primary }}>
                Back to Sign In
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

      <TouchableOpacity
        onPress={handleResetPassword}
        disabled={loading}
        activeOpacity={0.85}
        className={`py-4 rounded-xl mt-3 items-center ${loading ? "opacity-70" : ""}`}
        style={{ backgroundColor: colors.primary }}
      >
        <Text
          className="font-bold text-lg"
          style={{ color: colors.background }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Text>
      </TouchableOpacity>
    </AuthLayout>
  );
};

export default ForgotPasswordScreen;
