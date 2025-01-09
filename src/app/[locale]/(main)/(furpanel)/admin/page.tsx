'use client'
import UserPicture from "@/app/_components/userPicture";
import Button from "../../../../_components/button";
import Icon, { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";
import { UserData } from "@/app/_lib/api/user";
import Checkbox from "@/app/_components/checkbox";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import useTitle from "@/app/_lib/api/hooks/useTitle";

export default function AdminPage() {
  const t = useTranslations("furpanel");
  const router = useRouter();
  useTitle(t("admin.title"));

  return (
    <div className="page">
      {/* Membership area */}
      <div className="admin-section section vertical-list gap-2mm">
        <div className="horizontal-list section-title gap-2mm flex-vertical-center">
          <Icon className="x-large" iconName={ICONS.ID_CARD}></Icon>
          <span className="title medium">{t("admin.sections.membership")}</span>
        </div>
        {/* Membership card area */}
        <div className="vertical-list gap-2mm">
          <div className="horizontal-list section-title gap-2mm flex-vertical-center">
            <span className="title average">
              {t("admin.sections.membership_cards")}
            </span>
          </div>
          <div className="horizontal-list">
            <Button iconName={ICONS.ID_CARD} onClick={()=>router.push("/admin/memberships/a")}>
              {t("admin.membership_manager.title")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
