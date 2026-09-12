import React, { useState } from "react";
import { View, TouchableOpacity, Share, Platform } from "react-native";
import * as XLSX from "xlsx";
import { FileSpreadsheet, FileText, FileCode, Download, Table } from "lucide-react-native";
import {
  ApText,
  ApContainer,
  ApHeader,
  ApScrollView,
  ApLoader,
  ApCard,
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
  icon: React.ComponentType<{ size?: number; color?: string }>;
}[] = [
  {
    format: "excel",
    title: "Excel Spreadsheet",
    subtitle: "Formatted workbook with multiple sheets",
    icon: Table,
  },
  {
    format: "csv",
    title: "CSV Spreadsheet",
    subtitle: "Compatible with Excel, Google Sheets",
    icon: FileSpreadsheet,
  },
  {
    format: "pdf",
    title: "PDF Report",
    subtitle: "Styled report with summaries",
    icon: FileText,
  },
  {
    format: "json",
    title: "JSON Backup",
    subtitle: "Full data backup for developers",
    icon: FileCode,
  },
];

const IS_WEB = Platform.OS === "web";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadText(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

function downloadBase64(
  base64: string,
  filename: string,
  mimeType: string,
) {
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeType });
  downloadBlob(blob, filename);
}

const ExportScreen = () => {
  const { colors } = useSettingsState();
  const { user } = useAuthState();
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const handleExportExcel = async () => {
    if (!user?.id) return;
    setExporting("excel");
    try {
      const response = await axiosInstance.get("/export/json");
      const data = response.data;

      const wb = XLSX.utils.book_new();

      const profileRows = [
        ["Name", data.profile?.name ?? ""],
        ["Email", data.profile?.email ?? ""],
        ["Level", data.profile?.level ?? ""],
        ["XP", data.profile?.xp ?? ""],
        ["Coins", data.profile?.coins ?? ""],
        ["Longest Streak", data.profile?.longestStreak ?? ""],
        ["Total Habits", data.profile?.totalHabits ?? ""],
        [
          "Completion Rate",
          `${((data.profile?.completionRate ?? 0) * 100).toFixed(1)}%`,
        ],
        ["Member Since", data.profile?.createdAt ?? ""],
        ["Export Date", data.exportedAt ?? ""],
      ];
      const profileSheet = XLSX.utils.aoa_to_sheet(profileRows);
      XLSX.utils.book_append_sheet(wb, profileSheet, "Profile");

      if (data.habits?.length) {
        const habitRows = data.habits.map((h: any) => ({
          Habit: h.title,
          Category: h.category ?? "",
          Schedule: h.scheduleType ?? "",
          Priority: h.priority ?? "",
          Goal: h.goal,
          Unit: h.unit ?? "",
          Status: h.isArchived ? "Archived" : "Active",
          Created: h.createdAt,
        }));
        const habitSheet = XLSX.utils.json_to_sheet(habitRows);
        XLSX.utils.book_append_sheet(wb, habitSheet, "Habits");
      }

      const compRows: any[] = [];
      for (const h of data.habits ?? []) {
        for (const c of h.completions ?? []) {
          compRows.push({
            Habit: h.title,
            Date: c.date,
            Completed: c.status ? "Yes" : "No",
            Value: c.value,
            Kind: c.kind,
            Unit: h.unit ?? "",
          });
        }
      }
      if (compRows.length) {
        const compSheet = XLSX.utils.json_to_sheet(compRows);
        XLSX.utils.book_append_sheet(wb, compSheet, "Completions");
      }

      if (data.journal?.length) {
        const journalSheet = XLSX.utils.json_to_sheet(
          data.journal.map((j: any) => ({
            Date: j.date,
            Title: j.title,
            Mood: j.mood,
            Content: j.content,
            Tags: (j.tags ?? []).join(", "),
            Favorite: j.isFavorite ? "Yes" : "No",
          })),
        );
        XLSX.utils.book_append_sheet(wb, journalSheet, "Journal");
      }

      const financeRows: any[] = [];
      for (const e of data.expenses ?? []) {
        financeRows.push({
          Type: "Expense",
          Title: e.title,
          Amount: -e.amount,
          Date: e.date,
        });
      }
      for (const i of data.incomes ?? []) {
        financeRows.push({
          Type: "Income",
          Title: i.title,
          Amount: i.amount,
          Date: i.date,
        });
      }
      if (financeRows.length) {
        const finSheet = XLSX.utils.json_to_sheet(financeRows);
        XLSX.utils.book_append_sheet(wb, finSheet, "Finance");
      }

      if (data.identities?.length) {
        const identSheet = XLSX.utils.json_to_sheet(
          data.identities.map((id: any) => ({
            Identity: id.title,
            Description: id.description ?? "",
            Status: id.status,
            "Linked Habits": (id.linkedHabits ?? []).join(", "),
          })),
        );
        XLSX.utils.book_append_sheet(wb, identSheet, "Identities");
      }

      if (data.badges?.length) {
        const badgeSheet = XLSX.utils.json_to_sheet(
          data.badges.map((b: any) => ({
            Badge: b.title,
            Description: b.description ?? "",
            Type: b.type,
            "Earned At": b.earnedAt,
          })),
        );
        XLSX.utils.book_append_sheet(wb, badgeSheet, "Badges");
      }

      if (data.rewardLedger?.length) {
        const rewardSheet = XLSX.utils.json_to_sheet(
          data.rewardLedger.map((r: any) => ({
            Date: r.createdAt,
            Type: r.type,
            Amount: r.amount,
            Description: r.description ?? "",
          })),
        );
        XLSX.utils.book_append_sheet(wb, rewardSheet, "Rewards");
      }

      const base64 = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      downloadBase64(
        base64,
        "routina-export.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      ToastService.Success("Excel file downloaded");
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error("Excel export error:", msg, err);
      ToastService.Error(`Excel export failed: ${msg.substring(0, 120)}`);
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

      if (IS_WEB) {
        downloadText(response.data, "routina-export.csv", "text/csv");
        ToastService.Success("CSV file downloaded");
      } else {
        await Share.share({
          message: response.data,
          title: "Routina Export (CSV)",
        });
        ToastService.Success("CSV exported successfully");
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error("CSV export error:", msg, err);
      ToastService.Error(`CSV export failed: ${msg.substring(0, 120)}`);
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

      if (IS_WEB) {
        downloadText(
          response.data,
          "routina-report.html",
          "text/html",
        );
        ToastService.Success("PDF report downloaded as HTML");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Print = require("expo-print");
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Sharing = require("expo-sharing");
        const { uri } = await Print.printToFileAsync({
          html: response.data,
          base64: false,
        });
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Routina Report",
        });
        ToastService.Success("PDF report ready");
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error("PDF export error:", msg, err);
      ToastService.Error(`PDF export failed: ${msg.substring(0, 120)}`);
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

      if (IS_WEB) {
        downloadText(
          jsonStr,
          "routina-backup.json",
          "application/json",
        );
        ToastService.Success("JSON backup downloaded");
      } else {
        await Share.share({
          message: jsonStr,
          title: "Routina Backup (JSON)",
        });
        ToastService.Success("JSON backup exported");
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error("JSON export error:", msg, err);
      ToastService.Error(`JSON export failed: ${msg.substring(0, 120)}`);
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

  return (
    <ApContainer>
      <ApHeader title="Export Data" hasBackButton />
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-2">
          <ApText
            size="sm"
            color={colors.textSecondary}
            className="mb-4"
          >
            Export your habit data for backup or analysis. Your data belongs
            to you.
          </ApText>

          {exporting && (
            <View className="items-center mb-4">
              <ApLoader size="small" />
              <ApText size="xs" color={colors.textMuted} className="mt-2">
                Generating {exporting.toUpperCase()} file...
              </ApText>
            </View>
          )}

          {EXPORT_OPTIONS.map((option) => {
            const IconComp = option.icon;
            const isActive = exporting === option.format;
            return (
              <ApCard
                key={option.format}
                className="p-4 mb-3"
                style={{
                  borderColor: isActive ? colors.primary : colors.surfaceBorder,
                  opacity: exporting && !isActive ? 0.5 : 1,
                }}
              >
                <TouchableOpacity
                  onPress={handlers[option.format]}
                  disabled={!!exporting}
                  className="flex-row items-center"
                >
                  <View
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: colors.accentLight }}
                  >
                    <IconComp size={20} color={colors.primary} />
                  </View>
                  <View className="flex-1 mr-2">
                    <ApText
                      size="base"
                      font="semibold"
                      color={colors.textPrimary}
                    >
                      {option.title}
                    </ApText>
                    <ApText size="xs" color={colors.textMuted} className="mt-0.5">
                      {option.subtitle}
                    </ApText>
                  </View>
                  {isActive ? (
                    <ApLoader size="small" inline />
                  ) : (
                    <Download size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </ApCard>
            );
          })}

          <View className="mt-3 p-4 rounded-xl" style={{ backgroundColor: colors.surface2 }}>
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
