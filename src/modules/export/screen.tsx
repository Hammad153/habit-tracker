import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Alert, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ApText,
  ApContainer,
  ApHeader,
  ApScrollView,
  ApLoader,
} from "@/src/components";
import { useSettingsState } from "@/src/modules/settings/context";
import { useAuthState } from "@/src/modules/auth/context";
import axiosInstance from "@/src/libs/axios";
import { ToastService } from "@/src/services";

const ExportScreen = () => {
  const { colors } = useSettingsState();
  const { user } = useAuthState();
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    if (!user?.id) return;
    setExporting(true);
    try {
      const response = await axiosInstance.get(
        `/export/csv?userId=${user.id}`,
        { responseType: "text" },
      );
      await Share.share({
        message: response.data,
        title: "Habit Tracker Export",
      });
      ToastService.Success("Export ready to share!");
    } catch {
      ToastService.Error("Failed to export");
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    if (!user?.id) return;
    setExporting(true);
    try {
      const response = await axiosInstance.get(
        `/export/json?userId=${user.id}`,
      );
      await Share.share({
        message: JSON.stringify(response.data, null, 2),
        title: "Habit Tracker Export (JSON)",
      });
      ToastService.Success("Export ready to share!");
    } catch {
      ToastService.Error("Failed to export");
    } finally {
      setExporting(false);
    }
  };

  const exportOptions = [
    {
      title: "CSV Spreadsheet",
      subtitle: "Compatible with Excel, Google Sheets",
      icon: "document-text",
      color: colors.success,
      onPress: handleExportCSV,
    },
    {
      title: "JSON Backup",
      subtitle: "Full data backup for developers",
      icon: "code-slash",
      color: colors.accent,
      onPress: handleExportJSON,
    },
  ];

  return (
    <ApContainer>
      <ApHeader title="Export Data" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 mt-4">
          <ApText
            size="sm"
            color={colors.textSecondary}
            className="mb-6"
          >
            Export your habit data for backup or analysis. Your data belongs
            to you.
          </ApText>

          {exportOptions.map((option) => (
            <TouchableOpacity
              key={option.title}
              onPress={option.onPress}
              disabled={exporting}
              className="flex-row items-center p-4 mb-3 rounded-2xl border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.surfaceBorder,
                opacity: exporting ? 0.5 : 1,
              }}
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: option.color + "20" }}
              >
                <Ionicons
                  name={option.icon as any}
                  size={22}
                  color={option.color}
                />
              </View>
              <View className="flex-1 ml-3">
                <ApText
                  size="base"
                  font="semibold"
                  color={colors.textPrimary}
                >
                  {option.title}
                </ApText>
                <ApText size="xs" color={colors.textMuted} className="mt-1">
                  {option.subtitle}
                </ApText>
              </View>
              <Ionicons
                name="download-outline"
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default ExportScreen;
