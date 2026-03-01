import React, { useState } from "react";
import {
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "@/src/components/Text";
import { ApTheme } from "@/src/components/theme";
import { authService } from "@/src/services/auth.service";

interface ChangePasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isVisible,
  onClose,
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSave = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      Alert.alert("Success", "Password changed successfully");
      handleClose();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to change password";
      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}>
      <View style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <ApText size="xl" font="bold" color="white">
                Change Password
              </ApText>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}>
                <Ionicons
                  name="close"
                  size={24}
                  color={ApTheme.Color.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Old Password */}
              <View style={styles.inputContainer}>
                <ApText
                  size="sm"
                  color={ApTheme.Color.textMuted}
                  className="mb-2">
                  Current Password
                </ApText>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry={!showOldPassword}
                    placeholder="Enter current password"
                    placeholderTextColor={ApTheme.Color.textMuted}
                  />
                  <TouchableOpacity
                    onPress={() => setShowOldPassword(!showOldPassword)}
                    style={styles.eyeIcon}>
                    <Ionicons
                      name={showOldPassword ? "eye-off" : "eye"}
                      size={20}
                      color={ApTheme.Color.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputContainer}>
                <ApText
                  size="sm"
                  color={ApTheme.Color.textMuted}
                  className="mb-2">
                  New Password
                </ApText>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={ApTheme.Color.textMuted}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeIcon}>
                    <Ionicons
                      name={showNewPassword ? "eye-off" : "eye"}
                      size={20}
                      color={ApTheme.Color.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <ApText
                  size="sm"
                  color={ApTheme.Color.textMuted}
                  className="mb-2">
                  Confirm New Password
                </ApText>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={ApTheme.Color.textMuted}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}>
                    <Ionicons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color={ApTheme.Color.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Footer */}
            <TouchableOpacity
              style={[styles.saveButton, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleSave}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="black" />
              ) : (
                <ApText font="bold" color="black" size="lg">
                  Update Password
                </ApText>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  keyboardView: {
    width: "100%",
  },
  modalContent: {
    backgroundColor: ApTheme.Color.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ApTheme.Color.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ApTheme.Color.surfaceBorder,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: "white",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  saveButton: {
    backgroundColor: ApTheme.Color.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ChangePasswordModal;
