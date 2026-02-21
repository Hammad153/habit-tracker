import React, { useState } from "react";
import { Link, useRouter } from "expo-router";
import { toast } from "@/src/services/toast";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { authService } from "@/src/services/auth.service";
import { useAuth } from "@/src/components/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.show("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(email, password);
      await signIn(
        {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        },
        data.user,
      );

      toast.show("Logged in successfully", "success");
      router.replace("/(tabs)");
    } catch (error: any) {
      toast.show(error.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#121212]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6 pt-20">
        <View className="mb-12">
          <Text className="text-4xl font-bold text-white mb-2">
            Welcome Back
          </Text>
          <Text className="text-gray-400 text-lg">
            Sign in to continue your habit journey
          </Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-white mb-2 font-medium">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-[#1E1E1E] text-white px-4 py-4 rounded-xl border border-[#333]"
            />
          </View>

          <View className="mt-4">
            <Text className="text-white mb-2 font-medium">Password</Text>
            <View className="relative">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                className="bg-[#1E1E1E] text-white px-4 py-4 rounded-xl border border-[#333]"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2">
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`bg-[#6C38FF] py-4 rounded-xl mt-8 items-center ${loading ? "opacity-70" : ""}`}>
            <Text className="text-white font-bold text-lg">
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-400">Don't have an account? </Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text className="text-[#6C38FF] font-bold">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
