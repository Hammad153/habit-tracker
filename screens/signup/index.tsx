import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { authService } from "@/src/services/auth.service";
import { useAuth } from "@/src/components/AuthContext";
import { toast } from "@/src/services/toast";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      toast.show("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.signup({ name, email, password });
      await signIn(
        {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        },
        data.user,
      );

      toast.show("Account created successfully", "success");
      router.replace("/(tabs)");
    } catch (error: any) {
      toast.show(error.response?.data?.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#121212]"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6 pt-20"
      >
        <View className="mb-12">
          <Text className="text-4xl font-bold text-white mb-2">
            Create Account
          </Text>
          <Text className="text-gray-400 text-lg">
            Join us and start tracking your habits
          </Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-white mb-2 font-medium">Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#666"
              className="bg-[#1E1E1E] text-white px-4 py-4 rounded-xl border border-[#333]"
            />
          </View>

          <View className="mt-4">
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
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor="#666"
              secureTextEntry
              className="bg-[#1E1E1E] text-white px-4 py-4 rounded-xl border border-[#333]"
            />
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className={`bg-[#6C38FF] py-4 rounded-xl mt-8 items-center ${loading ? "opacity-70" : ""}`}
          >
            <Text className="text-white font-bold text-lg">
              {loading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8 pb-10">
          <Text className="text-gray-400">Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text className="text-[#6C38FF] font-bold">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
