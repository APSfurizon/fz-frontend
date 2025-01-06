'use client'
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import Button from "../../../../_components/button";
import { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function UserPage() {
  const t = useTranslations("furpanel");
  const router = useRouter();
  useTitle(t("user.title"));
  
  return (
    <div className="page"></div>
  );
}
