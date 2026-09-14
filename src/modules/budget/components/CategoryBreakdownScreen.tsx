import React, { useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import {
  ApHeader,
  ApEmptyState,
  Skeleton,
} from "@/src/components";
import { ProgressBar } from "@/src/components/ProgressBar";
import { useTheme } from "@/src/modules/settings/context";
import { useBudgetState } from "../context";

export const CategoryBreakdownScreen = () => {
  const colors = useTheme();
  const { summary, fetchSummary, loading } = useBudgetState();

  useEffect(() => {
    fetchSummary();
  }, []);

  const breakdown = summary?.categoryBreakdown ?? [];
  const maxTotal = Math.max(...breakdown.map((b: any) => b.total || 0), 1);

  return (
    <View className="flex-1 bg-background">
      <ApHeader title="Category breakdown" hasBackButton />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 }}
      >
        {loading && !summary ? (
          <View className="gap-3">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="p-4 rounded-lg bg-background-surface">
                <View className="flex-row items-center justify-between mb-3">
                  <Skeleton width="40%" height={16} />
                  <Skeleton width="20%" height={16} />
                </View>
                <Skeleton width="100%" height={6} borderRadius={3} />
              </View>
            ))}
          </View>
        ) : breakdown.length === 0 ? (
          <ApEmptyState
            title="No data available"
            description="Add expenses to see category-level spending breakdown."
          />
        ) : (
          <View className="gap-3">
            {breakdown.map((item: any, idx: number) => {
              const pct = (item.total || 0) / maxTotal;
              return (
                <View key={item.categoryId || idx} className="p-4 rounded-lg bg-background-surface">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-[15px] font-semibold text-ink-primary">
                      {item.categoryName || "General"}
                    </Text>
                    <Text className="text-[15px] font-bold text-ink-primary">
                      ${(item.total || 0).toLocaleString()}
                    </Text>
                  </View>
                  <ProgressBar progress={pct} tone="accent" height={5} />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CategoryBreakdownScreen;
