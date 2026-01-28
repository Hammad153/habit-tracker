import { useQuery } from "@tanstack/react-query";
import { timelineApi } from "@/libs/api";
import { Completion } from "@/src/types";

export const useTimeline = (userId: string = "default-user") => {
  return useQuery({
    queryKey: ["timeline", userId],
    queryFn: async () => {
      const response = await timelineApi.get(userId);
      return response.data as Completion[];
    },
  });
};
