"use client"
import Header from "@/app/_components/header";
import { HeaderProvider } from "@/app/_lib/context/headerProvider";

export default function MainLayout ({children}: Readonly<{children: React.ReactNode}>) {
    return (
        <HeaderProvider>
            <Header></Header>
            {children}
        </HeaderProvider>
    )
}