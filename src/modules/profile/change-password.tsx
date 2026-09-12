import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { router } from "expo-router";
import { ApText, ApContainer, ApHeader, ApScrollView } from "@/src/components";
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
  const [isFocused, setIsFocused] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <View className="mb-4">
      <ApText
        size="xs"
        font="medium"
        color={colors.textMuted}
        className="mb-1.5 uppercase"
        style={{ letterSpacing: 0.8 }}
      >
        {label}
      </ApText>
      <View
        className="flex-row items-center rounded-xl px-3.5 border"
        style={{
          backgroundColor: colors.surface,
          borderColor: isFocused ? colors.primary : colors.surfaceBorder,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          className="flex-1 py-3 text-sm"
          style={{ color: colors.textPrimary }}
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TouchableOpacity onPress={() => setShow((s) => !s)} hitSlop={10}>
          {show ? (
            <EyeOff size={18} color={colors.textMuted} />
          ) : (
            <Eye size={18} color={colors.textMuted} />
          )}
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
    <ApContainer>
      <ApHeader title="Change Password" hasBackButton />
      <ApScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
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
          className="py-3 rounded-xl items-center mt-3"
          style={{ backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 }}
        >
          <ApText font="semibold" size="sm" color={colors.background}>
            {submitting ? "Updating..." : "Update Password"}
          </ApText>
        </TouchableOpacity>
      </ApScrollView>
    </ApContainer>
  );
};

export default ChangePasswordScreen;
