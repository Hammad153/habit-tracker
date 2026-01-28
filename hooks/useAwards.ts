import { useQuery } from "@tanstack/react-query";
import { awardsApi } from "@/libs/api";
import { Badge, UserBadge } from "@/src/types";

export const useAwards = () => {
  return useQuery({
    queryKey: ["awards"],
    queryFn: async () => {
      const response = await awardsApi.getAll();
      return response.data as Badge[];
    },
  });
};

export const useUserBadges = (userId: string = "default-user") => {
  return useQuery({
    queryKey: ["user-badges", userId],
    queryFn: async () => {
      const response = await awardsApi.getUserBadges(userId);
      return response.data as UserBadge[];
    },
  });
};
