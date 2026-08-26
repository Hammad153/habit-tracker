import React from "react";
import { useLocalSearchParams } from "expo-router";
import IdentityFormScreen from "@/src/modules/identities/create-screen";
import { useIdentitiesState } from "@/src/modules/identities/context";
import { ApLoader } from "@/src/components";

export default function EditIdentityRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeIdentities } = useIdentitiesState();
  const identity = activeIdentities.find((i) => i.id === id);

  if (!identity) return <ApLoader label="Loading identity..." />;

  return <IdentityFormScreen identity={identity} />;
}
