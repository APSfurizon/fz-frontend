"use client"
import Header from "@/components/header";
import Modal from "@/components/modal";
import { HeaderProvider } from "@/lib/context/userProvider";
import { ModalProvider } from "@/lib/context/modalProvider";

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