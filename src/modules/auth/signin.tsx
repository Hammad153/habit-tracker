import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { ApText } from "@/src/components/Text";
import { ToastService } from "@/src/services";
import { useTheme } from "@/src/modules/settings/context";
import { useAuthState } from "./context";
import { AuthService } from "./api";

const SigninScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6 pt-20"
      >
        <View className="mb-12">
          <ApText
            size="3xl"
            font="bold"
            color={colors.textPrimary}
            className="mb-2"
          >
            Welcome Back
          </ApText>
          <ApText size="lg" color={colors.textSecondary}>
            Sign in to continue your habit journey
          </ApText>
        </View>

        <View className="space-y-6">
          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            outlineColor={colors.surfaceBorder}
            activeOutlineColor={colors.primary}
            textColor={colors.textPrimary}
            outlineStyle={{ borderRadius: 12 }}
            style={{ backgroundColor: colors.surface, marginBottom: 16 }}
            left={
              <TextInput.Icon icon="email-outline" color={colors.textMuted} />
            }
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            mode="outlined"
            outlineColor={colors.surfaceBorder}
            activeOutlineColor={colors.primary}
            textColor={colors.textPrimary}
            outlineStyle={{ borderRadius: 12 }}
            style={{ backgroundColor: colors.surface, marginBottom: 16 }}
            left={
              <TextInput.Icon icon="lock-outline" color={colors.textMuted} />
            }
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                color={colors.textMuted}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            buttonColor={colors.primary}
            textColor={colors.background}
            labelStyle={{
              fontSize: 18,
              paddingVertical: 6,
              fontWeight: "bold",
            }}
            style={{ borderRadius: 12, marginTop: 24 }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </View>

        <View className="flex-row justify-center mt-8">
          <ApText color={colors.textSecondary}>Don't have an account? </ApText>
          <Link href="/signup" asChild>
            <ApText font="bold" color={colors.primary} onPress={() => {}}>
              Sign Up
            </ApText>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SigninScreen;
