import React from "react";
import { useLocalSearchParams } from "expo-router";
import ShareTombstoneScreen from "@/src/modules/habits/components/ShareTombstone";

const ShareTombstoneRoute = () => {
  const { burialId } = useLocalSearchParams<{ burialId: string }>();
  return <ShareTombstoneScreen burialId={burialId!} />;
};

export default ShareTombstoneRoute;
