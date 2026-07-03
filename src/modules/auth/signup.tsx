import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
          <Text
            className="text-4xl font-bold mb-2"
            style={{ color: colors.textPrimary }}
          >
            Create Account
          </Text>
          <Text className="text-lg" style={{ color: colors.textSecondary }}>
            Join us and start tracking your habits
          </Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text
              className="mb-2 font-medium"
              style={{ color: colors.textPrimary }}
            >
              Full Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              className="px-4 py-4 rounded-xl"
              style={{
                backgroundColor: colors.surface,
                color: colors.textPrimary,
              }}
            />
          </View>

          <View className="mt-4">
            <Text
              className="mb-2 font-medium"
              style={{ color: colors.textPrimary }}
            >
              Email Address
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              className="px-4 py-4 rounded-xl"
              style={{
                backgroundColor: colors.surface,
                color: colors.textPrimary,
              }}
            />
          </View>

          <View className="mt-4">
            <Text
              className="mb-2 font-medium"
              style={{ color: colors.textPrimary }}
            >
              Password
            </Text>
            <View className="relative">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                className="px-4 py-4 rounded-xl"
                style={{
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className={`py-4 rounded-xl mt-8 items-center ${loading ? "opacity-70" : ""}`}
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="font-bold text-lg"
              style={{ color: colors.background }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8 pb-10">
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;
