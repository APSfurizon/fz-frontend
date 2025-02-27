"use client"
import { Permissions } from "@/lib/api/permission";
import { useUser } from "@/lib/context/userProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function adminLayout({children}: Readonly<{children: React.ReactNode;}>){
    const router = useRouter();
    const {userLoading, userDisplay} = useUser();

    useEffect(()=>{
        if (userLoading || !userDisplay) return;
        if (!userDisplay.permissions?.includes(Permissions.CAN_SEE_ADMIN_PAGES)) {
            router.replace("/home");
        }
    }, [userLoading, userDisplay]);

    return children;
}