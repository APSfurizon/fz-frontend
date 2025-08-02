"use client"
import Header from "@/components/header";
import { HeaderProvider } from "@/components/context/userProvider";
import { ModalProvider } from "@/components/context/modalProvider";

export default function MainLayout ({children}: Readonly<{children: React.ReactNode}>) {
    return (
        <HeaderProvider>
            <ModalProvider>
                <Header></Header>
                {children}
            </ModalProvider>
        </HeaderProvider>
    )
}