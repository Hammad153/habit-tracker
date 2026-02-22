import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { habitApi } from "@/libs/api";
import { Habit } from "@/src/types";

interface HabitParams {
  id: string;
  date: string;
  value?: number;
}

export const useHabits = (userId: string = "default-user") => {
  return useQuery({
    queryKey: ["habits", userId],
    queryFn: async () => {
      const response = await habitApi.getAll(userId);
      return response.data as Habit[];
    },
  });
};

export const useHabit = (id: string) => {
  return useQuery({
    queryKey: ["habit", id],
    queryFn: async () => {
      const response = await habitApi.getById(id);
      return response.data as Habit;
    },
    enabled: !!id,
  });
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Habit>) => habitApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
};

export const useUpdateHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Habit> }) =>
      habitApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["habit", variables.id] });
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
};

export const useToggleHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date, value }: HabitParams) =>
      habitApi.toggle(id, date, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
    },
  });
};
