"use client";
import { ModalProvider } from "./modalProvider";
import { HeaderProvider } from "./userProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeaderProvider>
      <ModalProvider>{children}</ModalProvider>
    </HeaderProvider>
  );
}
