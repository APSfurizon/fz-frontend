"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModalProvider } from "./modalProvider";
import { HeaderProvider } from "./userProvider";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeaderProvider>
      <QueryClientProvider client={queryClient}>
        <ModalProvider>{children}</ModalProvider>
      </QueryClientProvider>
    </HeaderProvider>
  );
}
