"use client"
import Header from "@/app/_components/header";
import Modal from "@/app/_components/modal";
import { HeaderProvider } from "@/app/_lib/context/userProvider";
import { ModalProvider } from "@/app/_lib/context/modalProvider";

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