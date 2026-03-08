import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { ApText } from "@/src/components/Text";
import { ToastService } from "@/src/services";
import { useTheme } from "@/src/modules/settings/context";
import { useAuthState } from "./context";
import { AuthService } from "./api";

const SignupScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
            Create Account
          </ApText>
          <ApText size="lg" color={colors.textSecondary}>
            Join us and start tracking your habits
          </ApText>
        </View>

        <View className="space-y-6">
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            mode="outlined"
            outlineColor={colors.surfaceBorder}
            activeOutlineColor={colors.primary}
            textColor={colors.textPrimary}
            outlineStyle={{ borderRadius: 12 }}
            style={{ backgroundColor: colors.surface, marginBottom: 16 }}
            left={
              <TextInput.Icon icon="account-outline" color={colors.textMuted} />
            }
          />

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
            placeholder="Create a password"
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
            onPress={handleSignup}
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
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </View>

        <View className="flex-row justify-center mt-8 pb-10">
          <ApText color={colors.textSecondary}>
            Already have an account?{" "}
          </ApText>
          <Link href="/login" asChild>
            <ApText font="bold" color={colors.primary} onPress={() => {}}>
              Sign In
            </ApText>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;
