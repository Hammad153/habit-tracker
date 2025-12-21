import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ApText } from "../../components/Text";
import { ApTheme } from "../../components/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { TIMELINE_DATA } from "./data";

export default function TimelineScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: ApTheme.Color.background }}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-2 pb-6 flex-row justify-between items-start">
          <View>
            <ApText size="2xl" font="bold" color="white" className="mb-1">
              Your Journey
            </ApText>
            <ApText
              size="sm"
              font="bold"
              style={{ color: ApTheme.Color.primary, letterSpacing: 1 }}
            >
              OCTOBER 2023
            </ApText>
          </View>
          <TouchableOpacity
            className="flex-row items-center px-4 py-2 rounded-full border border-white/20"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <Ionicons name="filter" size={16} color={ApTheme.Color.primary} />
            <ApText size="sm" color="white" className="ml-2">
              Filter
            </ApText>
          </TouchableOpacity>
        </View>

        <View className="flex-row px-5 space-x-3 mb-8">
          {/* Day Streak Card */}
          <View
            className="flex-1 rounded-2xl p-4 items-center justify-center space-y-2"
            style={{
              backgroundColor: ApTheme.Color.surface,
              borderColor: ApTheme.Color.surfaceBorder,
              borderWidth: 1,
            }}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center bg-green-500/20 mb-1">
              <Ionicons name="flame" size={20} color={ApTheme.Color.primary} />
            </View>
            <ApText size="3xl" font="bold" color="white">
              12
            </ApText>
            <ApText size="xs" color={ApTheme.Color.textSecondary} style={{ letterSpacing: 0.5 }}>
              DAY STREAK
            </ApText>
          </View>

          {/* Completion Card */}
          <View
            className="flex-1 rounded-2xl p-4 items-center justify-center space-y-2"
            style={{
              backgroundColor: ApTheme.Color.surface,
              borderColor: ApTheme.Color.surfaceBorder,
              borderWidth: 1,
            }}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center bg-blue-500/20 mb-1">
              <Ionicons name="pie-chart" size={20} color="#38BDF8" />
            </View>
            <ApText size="3xl" font="bold" color="white">
              85%
            </ApText>
            <ApText size="xs" color={ApTheme.Color.textSecondary} style={{ letterSpacing: 0.5 }}>
              COMPLETION
            </ApText>
          </View>
        </View>

        {/* Timeline */}
        <View className="px-5">
          {TIMELINE_DATA.map((item, index) => {
            const isLast = index === TIMELINE_DATA.length - 1;
            return (
              <View key={item.id} className="flex-row relative">
                {/* Vertical Line */}
                {!isLast && (
                  <View
                    className="absolute left-[24px] top-[50px] bottom-[-20px] w-[2px] z-0"
                    style={{ backgroundColor: ApTheme.Color.surfaceBorder }}
                  />
                )}
                {/* Active Line Highlight - rough approx for first item */}
                {index === 0 && (
                   <View
                    className="absolute left-[24px] top-[50px] h-[50px] w-[2px] z-10"
                    style={{ backgroundColor: ApTheme.Color.primary }}
                  />
                )}

                {/* Icon Column */}
                <View className="mr-4 items-center z-10">
                  <View
                    className={`w-12 h-12 rounded-full items-center justify-center border-4 ${
                      item.isCurrent ? "border-green-500/30" : "border-transparent"
                    }`}
                    style={{
                      backgroundColor: item.isCurrent ? ApTheme.Color.primary : ApTheme.Color.surfaceInactive,
                    }}
                  >
                    <Ionicons
                      name={(item.icon as any)}
                      size={24}
                      color={item.isCurrent ? "#000" : item.iconColor}
                    />
                  </View>
                </View>

                {/* Content Card */}
                <View
                  className="flex-1 mb-5 rounded-2xl p-4 border"
                  style={{
                    backgroundColor: ApTheme.Color.surface,
                    borderColor: ApTheme.Color.surfaceBorder,
                  }}
                >
                  <View className="flex-row justify-between items-start mb-1">
                    <ApText size="lg" font="bold" color="white">
                      {item.cardTitle}
                    </ApText>
                    {item.percentage && (
                      <View className="px-2 py-1 rounded bg-black/30">
                        <ApText size="xs" font="bold" color={ApTheme.Color.textMuted}>
                          {item.percentage}
                        </ApText>
                      </View>
                    )}
                     {!item.percentage && (
                      <ApText size="xs" color={ApTheme.Color.textMuted} className="pt-1">
                        {item.date}
                      </ApText>
                    )}
                  </View>

                  <ApText
                    size="base"
                    color={item.isCurrent ? ApTheme.Color.primary : ApTheme.Color.textSecondary}
                    className="mb-3"
                  >
                    {item.cardSubtitle}
                  </ApText>

                  {/* Tiny progress bars mock */}
                  <View className="flex-row space-x-2">
                    <View className="h-1.5 flex-1 rounded-full bg-green-500" />
                    <View className="h-1.5 flex-1 rounded-full bg-green-500" />
                    <View className={`h-1.5 flex-1 rounded-full ${item.isCurrent ? 'bg-green-500' : 'bg-white/10'}`} />
                     <View className={`h-1.5 flex-1 rounded-full ${item.isCurrent ? 'bg-green-500' : 'bg-green-500'}`} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-8 right-5 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{
          backgroundColor: ApTheme.Color.primary,
          shadowColor: ApTheme.Color.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
        onPress={() => {}}
      >
        <Ionicons name="calendar" size={24} color="#000" />
      </TouchableOpacity>
      
      {/* Back Button (since it's not a tab) */}
       <TouchableOpacity
        className="absolute bottom-8 left-5 w-12 h-12 rounded-full items-center justify-center bg-surface border border-white/10"
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
