import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { ApLoader, ApText } from "@/src/components";
import AdminPage from "@/src/modules/admin/components/AdminPage";
import { AdminService } from "@/src/modules/admin/api";
import {
  EmptyState,
  ErrorState,
  SearchField,
  Row,
  formatDate,
} from "@/src/modules/admin/components/AdminUI";
import { useTheme } from "@/src/modules/settings/context";

export default function AdminAuditLogs() {
  const colors = useTheme();
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    AdminService.getAuditLogs({
      search: search || undefined,
      page: 1,
      limit: 30,
    })
      .then(setData)
      .catch(() => setError(true));
  };
  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search]);
  if (!data && !error) return <ApLoader />;
  return (
    <AdminPage
      title="Audit Logs"
      description="Review administrative actions without exposing unnecessary sensitive payloads."
    >
      <View className="mb-4">
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search action, target, or admin"
        />
      </View>
      {error ? (
        <ErrorState onRetry={load} />
      ) : !data?.items?.length ? (
        <EmptyState
          title="No audit events"
          description="No matching administrative activity was found."
        />
      ) : (
        <View
          className="rounded-2xl border px-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.surfaceBorder,
          }}
        >
          {data.items.map((item: any) => (
            <Row key={item.id}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <ApText font="bold">{item.action}</ApText>
                  <ApText size="sm" color={colors.textMuted} className="mt-1">
                    {item.targetType || "System"}
                    {item.targetId ? ` · ${item.targetId}` : ""}
                  </ApText>
                </View>
                <ApText size="xs" color={colors.textMuted}>
                  {formatDate(item.createdAt)}
                </ApText>
              </View>
              <ApText size="xs" color={colors.textMuted} className="mt-2">
                By {item.admin?.name || item.admin?.email || "Administrator"}
              </ApText>
            </Row>
          ))}
        </View>
      )}
    </AdminPage>
  );
}
