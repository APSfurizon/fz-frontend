"use client";
import { useUser } from "@/components/context/userProvider";
import { Permissions } from "@/lib/api/permission";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { userLoading, userDisplay } = useUser();

  useEffect(() => {
    if (userLoading || !userDisplay) return;
    if (!userDisplay.permissions?.includes(Permissions.CAN_SEE_ADMIN_PAGES)) {
      router.replace("/reservation");
    }
  }, [userLoading, userDisplay]);

  return children;
}
