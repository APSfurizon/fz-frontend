import { getTitleMetadata } from "@/lib/api/user/server";
import { Metadata } from "next";
import React from "react";

export async function generateMetadata(): Promise<Metadata> {
  return await getTitleMetadata((t) => t("authentication.login.title"));
}

export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
