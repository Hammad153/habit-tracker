import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/libs/api";
import { User } from "@/src/types";

export const useProfile = (userId: string = "default-user") => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const response = await profileApi.get(userId);
      return response.data as User;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      profileApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
