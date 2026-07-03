import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ApText, ApContainer, ApHeader } from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { ProfileService } from "./api";
import { ToastService } from "@/src/services";

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  colors: any;
}

const PasswordField: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  error,
  colors,
}) => {
  const [show, setShow] = useState(false);
  return (
    <View className="mb-5">
      <ApText size="sm" font="semibold" color={colors.textMuted} className="mb-2">
        {label}
      </ApText>
      <View
        className="flex-row items-center rounded-2xl px-4"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.surfaceBorder,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          className="flex-1 py-4"
          style={{ color: colors.textPrimary }}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShow((s) => !s)} hitSlop={10}>
          <Ionicons
            name={show ? "eye-off" : "eye"}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      </View>
      {error ? (
        <ApText size="xs" color={colors.danger} className="mt-1">
          {error}
        </ApText>
      ) : null}
    </View>
  );
};

const ChangePasswordScreen = () => {
  const { colors } = useSettingsState();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!oldPassword) e.oldPassword = "Current password is required";
    if (newPassword.length < 8)
      e.newPassword = "New password must be at least 8 characters";
    if (newPassword !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await ProfileService.changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      ToastService.Success("Password updated successfully");
      router.back();
    } catch (err: any) {
      ToastService.ApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ApContainer className="flex-1">
      <ApHeader title="Change Password" hasBackButton />
      <ScrollView
        className="flex-1 px-5 pt-6"
        keyboardShouldPersistTaps="handled"
      >
        <PasswordField
          label="Current Password"
          value={oldPassword}
          onChangeText={setOldPassword}
          error={errors.oldPassword}
          colors={colors}
        />
        <PasswordField
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          error={errors.newPassword}
          colors={colors}
        />
        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={errors.confirmPassword}
          colors={colors}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className="py-4 rounded-2xl items-center mt-2"
          style={{ backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 }}
        >
          <ApText font="bold" color={colors.background}>
            {submitting ? "Updating..." : "Update Password"}
          </ApText>
        </TouchableOpacity>
      </ScrollView>
    </ApContainer>
  );
};

export default ChangePasswordScreen;
