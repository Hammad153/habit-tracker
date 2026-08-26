import React, { useState } from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { Paths, File, Directory, EncodingType } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
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

type ExportFormat = "excel" | "csv" | "pdf" | "json";

const EXPORT_OPTIONS: {
  format: ExportFormat;
  title: string;
  subtitle: string;
  icon: string;
  colorKey: "primary" | "success" | "accent" | "warning";
}[] = [
  {
    format: "excel",
    title: "Excel Spreadsheet",
    subtitle: "Formatted workbook with multiple sheets",
    icon: "grid",
    colorKey: "primary",
  },
  {
    format: "csv",
    title: "CSV Spreadsheet",
    subtitle: "Compatible with Excel, Google Sheets",
    icon: "document-text",
    colorKey: "success",
  },
  {
    format: "pdf",
    title: "PDF Report",
    subtitle: "Styled report with summaries",
    icon: "document",
    colorKey: "accent",
  },
  {
    format: "json",
    title: "JSON Backup",
    subtitle: "Full data backup for developers",
    icon: "code-slash",
    colorKey: "warning",
  },
];

const ExportScreen = () => {
  const { colors } = useSettingsState();
  const { user } = useAuthState();
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const getExportDir = (): Directory => {
    return new Directory(Paths.document, "exports");
  };

  const ensureExportDir = (): Directory => {
    const dir = getExportDir();
    if (!dir.exists) {
      dir.create({ intermediates: true });
    }
    return dir;
  };

  const shareFile = async (file: File, mimeType: string, title: string) => {
    if (Platform.OS === "ios") {
      await Sharing.shareAsync(file.uri, {
        mimeType,
        dialogTitle: title,
        UTI: mimeType,
      });
    } else {
      await Sharing.shareAsync(file.uri, {
        mimeType,
        dialogTitle: title,
      });
    }
  };

  const handleExportExcel = async () => {
    if (!user?.id) return;
    setExporting("excel");
    try {
      const response = await axiosInstance.get("/export/excel", {
        responseType: "arraybuffer",
      });

      const dir = ensureExportDir();
      const file = new File(dir, "habit-tracker-export.xlsx");
      if (file.exists) file.delete();
      file.create({ overwrite: true });

      const uint8 = new Uint8Array(response.data);
      file.write(uint8);

      await shareFile(
        file,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Habit Tracker Export (Excel)",
      );
      ToastService.Success("Excel file ready!");
    } catch {
      ToastService.Error("Failed to export Excel file");
    } finally {
      setExporting(null);
    }
  };

  const handleExportCSV = async () => {
    if (!user?.id) return;
    setExporting("csv");
    try {
      const response = await axiosInstance.get("/export/csv", {
        responseType: "text",
      });

      const dir = ensureExportDir();
      const file = new File(dir, "habit-tracker-export.csv");
      if (file.exists) file.delete();
      file.create({ overwrite: true });

      file.write(response.data, { encoding: EncodingType.UTF8 });

      await shareFile(file, "text/csv", "Habit Tracker Export (CSV)");
      ToastService.Success("CSV file ready!");
    } catch {
      ToastService.Error("Failed to export CSV file");
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    if (!user?.id) return;
    setExporting("pdf");
    try {
      const response = await axiosInstance.get("/export/pdf", {
        responseType: "text",
      });

      const { uri } = await Print.printToFileAsync({
        html: response.data,
        base64: false,
      });

      const dir = ensureExportDir();
      const file = new File(dir, "habit-tracker-report.pdf");

      const tempFile = new File(uri);
      if (tempFile.exists) {
        if (file.exists) file.delete();
        tempFile.move(file, { overwrite: true });
      }

      await shareFile(file, "application/pdf", "Habit Tracker Report");
      ToastService.Success("PDF report ready!");
    } catch {
      ToastService.Error("Failed to generate PDF report");
    } finally {
      setExporting(null);
    }
  };

  const handleExportJSON = async () => {
    if (!user?.id) return;
    setExporting("json");
    try {
      const response = await axiosInstance.get("/export/json");
      const jsonStr = JSON.stringify(response.data, null, 2);

      const dir = ensureExportDir();
      const file = new File(dir, "habit-tracker-backup.json");
      if (file.exists) file.delete();
      file.create({ overwrite: true });

      file.write(jsonStr, { encoding: EncodingType.UTF8 });

      await shareFile(file, "application/json", "Habit Tracker Backup (JSON)");
      ToastService.Success("JSON backup ready!");
    } catch {
      ToastService.Error("Failed to export JSON backup");
    } finally {
      setExporting(null);
    }
  };

  const handlers: Record<ExportFormat, () => Promise<void>> = {
    excel: handleExportExcel,
    csv: handleExportCSV,
    pdf: handleExportPDF,
    json: handleExportJSON,
  };

  const getColor = (key: "primary" | "success" | "accent" | "warning") => {
    switch (key) {
      case "primary":
        return colors.primary;
      case "success":
        return colors.success;
      case "accent":
        return colors.accent;
      case "warning":
        return colors.warning;
    }
  };

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

          {exporting && (
            <View className="items-center mb-4">
              <ApLoader />
              <ApText size="xs" color={colors.textMuted} className="mt-2">
                Generating {exporting.toUpperCase()} file...
              </ApText>
            </View>
          )}

          {EXPORT_OPTIONS.map((option) => {
            const color = getColor(option.colorKey);
            const isActive = exporting === option.format;
            return (
              <TouchableOpacity
                key={option.format}
                onPress={handlers[option.format]}
                disabled={!!exporting}
                className="flex-row items-center p-4 mb-3 rounded-2xl border"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: isActive ? color : colors.surfaceBorder,
                  borderWidth: isActive ? 2 : 1,
                  opacity: exporting && !isActive ? 0.5 : 1,
                }}
              >
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{ backgroundColor: color + "20" }}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={22}
                    color={color}
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
                {isActive ? (
                  <ApLoader size="small" />
                ) : (
                  <Ionicons
                    name="download-outline"
                    size={22}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}

          <View
            className="mt-4 p-4 rounded-2xl"
            style={{ backgroundColor: colors.surface }}
          >
            <ApText size="xs" color={colors.textMuted} className="leading-5">
              Excel and CSV exports include all your habits, completions,
              journal entries, finances, identities, daily plans, badges, and
              reward history. PDF exports include a formatted summary report.
              JSON backups contain the complete raw data for restoration.
            </ApText>
          </View>
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default ExportScreen;
