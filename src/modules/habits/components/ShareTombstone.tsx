import React, { useCallback, useRef, useState } from "react";
import { View, Text, Platform, Dimensions } from "react-native";
import ViewShot from "react-native-view-shot";
import { useTheme } from "@/src/modules/settings/context";
import { useHabitState } from "@/src/modules/habits/context";
import { lifespanLabel } from "@/src/modules/habits/epitaph";
import { format } from "date-fns";
import { ApHeader } from "@/src/components/Header";
import { Button } from "@/src/components/buttons/Button";
import { ToastService } from "@/src/services";

const { width } = Dimensions.get("window");

interface ShareTombstoneProps {
  burialId: string;
}

export const ShareTombstoneScreen: React.FC<ShareTombstoneProps> = ({ burialId }) => {
  const colors = useTheme();
  const { burials } = useHabitState();
  const viewShotRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);

  const burial = burials.find((b) => b.id === burialId);

  const captureAndShare = useCallback(async () => {
    if (!burial) return;
    setSharing(true);

    try {
      if (Platform.OS === "web") {
        const { default: domtoimage } = await import("dom-to-image");
        const node = document.querySelector("[data-tombstone-capture]");
        if (!node) throw new Error("Tombstone capture target not found");

        const dataUrl = await domtoimage.toPng(node, {
          width: 600,
          height: 1000,
          style: {
            transform: "scale(1)",
            transformOrigin: "center",
          },
        });

        const link = document.createElement("a");
        link.download = `tombstone-${burial.title.replace(/\s+/g, "-").toLowerCase()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        ToastService.Success("Tombstone image saved");
      } else {
        const uri = await (viewShotRef.current as any)?.capture?.();
        if (uri) {
          const sharingModule = await import("expo-sharing");
          const Sharing = (sharingModule as any).default ?? sharingModule;
          await Sharing.shareAsync(uri, {
            dialogTitle: `Share ${burial.title}`,
            UTI: "image/jpeg",
          });
        }
      }
    } catch (error) {
      ToastService.ApiError(error as Error);
    } finally {
      setSharing(false);
    }
  }, [burial]);

  if (!burial) {
    return null;
  }

  const lifespanDays = Math.max(
    1,
    Math.round((new Date(burial.buriedAt).getTime() - new Date(burial.habitCreatedAt).getTime()) / 86_400_000),
  );

  return (
    <View className="flex-1 bg-background">
      <ApHeader title="Share Tombstone" hasBackButton />

      <View className="flex-1 p-4">
        <ViewShot ref={viewShotRef} style={{ width }}>
          <View
            data-tombstone-capture={Platform.OS === "web" ? "true" : undefined}
            className="w-full rounded-3xl p-6 text-center"
            style={{
              backgroundColor: "#E8E4DF",
              borderWidth: 1,
              borderColor: "#C7C2B9",
            }}
          >
            <View className="mb-4">
              <Text className="text-[10px] font-bold text-uppercase opacity-60">
                RIP
              </Text>
              <Text className="text-[24px] font-bold mb-1">{burial.title}</Text>
              <Text className="text-[14px] font-medium opacity-70">
                {format(new Date(burial.buriedAt), "MMM d, yyyy")}
              </Text>
            </View>
            <View className="my-4">
              <Text className="text-[20px] font-bold">{lifespanLabel(lifespanDays)}</Text>
              <Text className="text-[12px] opacity-60">Lifespan</Text>
            </View>
            <View className="flex-row justify-center gap-2 mb-4 opacity-60">
              <Text className="text-[12px]">{burial.totalCompletions} completions</Text>
              <Text className="text-[12px]">{burial.bestStreak} best streak</Text>
            </View>
            <Text
              className="text-[16px] leading-[22px] italic"
              style={{ color: colors.inkPrimary }}
            >
              {'"' + burial.epitaph + '"'}
            </Text>
            {burial.reason && (
              <View className="mt-4 pt-4 border-t border-border">
                <Text className="text-[12px] font-medium" style={{ color: colors.inkTertiary }}>
                  Reason: {burial.reason}
                </Text>
              </View>
            )}
          </View>
        </ViewShot>

        <View className="mt-6 flex-row gap-2">
          <Button
            label="Save Image"
            onPress={captureAndShare}
            variant="primary"
            loading={sharing}
            className="flex-1"
          />
          <Button
            label="Cancel"
            variant="tertiary"
            className="flex-1"
          />
        </View>
      </View>
    </View>
  );
};

export default ShareTombstoneScreen;
