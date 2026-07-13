import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContextProvider } from "@/src/context";

interface IProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

const ApProvider: React.FC<IProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>{children}</AppContextProvider>
    </QueryClientProvider>
  );
};

export default ApProvider;
