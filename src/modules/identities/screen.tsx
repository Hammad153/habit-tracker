import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ApText,
  ApContainer,
  ApScrollView,
  ApHeader,
} from "@/src/components";
import { router } from "expo-router";
import { useSettingsState } from "@/src/modules/settings/context";
import { useIdentitiesState } from "./context";
import { IIdentity } from "./model";

const LEVEL_BAR_HEIGHT = 8;

const IdentityScreen = () => {
  const { colors } = useSettingsState();
  const { loading, activeIdentities } = useIdentitiesState();

  const progressFor = (identity: IIdentity) => {
    const points = identity.evidencePoints ?? 0;
    const level = identity.level ?? 1;
    const pct = identity.progressToNextLevel;
    return { points, level, pct };
  };

  return (
    <ApContainer>
      <ApScrollView showsVerticalScrollIndicator={false}>
        <ApHeader
          title="Identity"
          subheader="Every action is a vote for the person you want to become"
          hasBackButton
        />

        {/* Active identities */}
        <View className="px-5 mt-4">
          {activeIdentities.length === 0 && !loading && (
            <View
              className="rounded-3xl p-6 items-center"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.surfaceBorder,
              }}
            >
              <Ionicons
                name="flag-outline"
                size={40}
                color={colors.textMuted}
              />
              <ApText
                size="base"
                font="semibold"
                color={colors.textPrimary}
                className="mt-3"
              >
                Who do you want to become?
              </ApText>
              <ApText
                size="xs"
                color={colors.textMuted}
                className="mt-1 text-center"
              >
                Create an identity like &quot;I am a runner&quot;, then link
                habits that prove it.
              </ApText>
            </View>
          )}

          {activeIdentities.map((identity) => {
            const accent = identity.color || colors.primary;
            const { points, level, pct } = progressFor(identity);
            return (
              <Pressable
                key={identity.id}
                onPress={() =>
                  router.push(`/edit-identity?id=${identity.id}`)
                }
                className="rounded-3xl p-4 mb-4 mt-4"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.surfaceBorder,
                }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-11 h-11 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: accent + "1E" }}
                  >
                    <Ionicons
                      name={(identity.icon || "flag") as any}
                      size={22}
                      color={accent}
                    />
                  </View>
                  <View className="flex-1 ml-3">
                    <ApText
                      size="base"
                      font="bold"
                      color={colors.textPrimary}
                      numberOfLines={1}
                    >
                      {identity.title}
                    </ApText>
                    <ApText size="xs" color={colors.textMuted}>
                      Level {level} · {identity.levelTitle}
                    </ApText>
                  </View>
                  <View
                    className="px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: accent + "1A" }}
                  >
                    <ApText size="xs" font="bold" color={accent}>
                      {points} pts
                    </ApText>
                  </View>
                </View>

                {identity.description ? (
                  <ApText
                    size="xs"
                    color={colors.textSecondary}
                    className="mt-2"
                    numberOfLines={2}
                  >
                    {identity.description}
                  </ApText>
                ) : null}

                {/* Level bar */}
                <View
                  className="mt-3 rounded-full overflow-hidden"
                  style={{
                    height: LEVEL_BAR_HEIGHT,
                    backgroundColor: colors.surfaceBorder,
                  }}
                >
                  {pct != null && (
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        backgroundColor: accent,
                      }}
                    />
                  )}
                </View>

                <View className="flex-row justify-between mt-2">
                  <ApText size="xs" color={colors.textMuted}>
                    {identity.linkedHabits ?? 0} linked habit
                    {(identity.linkedHabits ?? 0) === 1 ? "" : "s"}
                  </ApText>
                  <ApText size="xs" color={colors.textMuted}>
                    {identity.completedOnDate ?? 0} today ·{" "}
                    {pct === null
                      ? "Max level reached"
                      : `${identity.pointsToNextLevel ?? 0} pts to level ${level + 1}`}
                  </ApText>
                </View>

                {(identity.habitLinks ?? []).length > 0 && (
                  <View className="flex-row flex-wrap mt-2">
                    {(identity.habitLinks ?? [])
                      .filter((link) => !link.habit?.isArchived)
                      .slice(0, 5)
                      .map((link) => (
                        <View
                          key={link.habitId}
                          className="flex-row items-center px-2 py-1 rounded-full mr-1.5 mb-1"
                          style={{
                            backgroundColor: colors.surfaceBorder + "80",
                          }}
                        >
                          <Ionicons
                            name={(link.habit?.icon || "ellipse") as any}
                            size={11}
                            color={link.habit?.iconColor || colors.primary}
                          />
                          <ApText
                            size="xs"
                            color={colors.textSecondary}
                            className="ml-1"
                            numberOfLines={1}
                          >
                            {link.habit?.title ?? "Habit"}
                          </ApText>
                        </View>
                      ))}
                  </View>
                )}
              </Pressable>
            );
          })}

          <Pressable
            onPress={() => router.push("/create-identity")}
            className="mb-6 h-12 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            <ApText size="sm" font="bold" color={colors.background}>
              New Identity
            </ApText>
          </Pressable>
        </View>
      </ApScrollView>
    </ApContainer>
  );
};

export default IdentityScreen;
