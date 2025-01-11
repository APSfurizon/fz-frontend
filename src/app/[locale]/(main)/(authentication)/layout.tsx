'use client'
import { useUser } from "@/app/_lib/context/userProvider";
import { useEffect } from "react";

export default function Layout({children}: Readonly<{children: React.ReactNode;}>) {
    const {setUpdateUser} = useUser();

    useEffect(()=>setUpdateUser(true), []);

    return (
        <div className="main-dialog rounded-s">
            {children}
        </div>
    );
  }