import React from "react";
import { useLocalSearchParams } from "expo-router";
import TombstoneDetail from "@/src/modules/habits/components/TombstoneDetail";

const BurialDetailRoute = () => {
  const { burialId } = useLocalSearchParams<{ burialId: string }>();
  return <TombstoneDetail burialId={burialId!} />;
};

export default BurialDetailRoute;
