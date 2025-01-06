'use client'
import UserPicture from "@/app/_components/userPicture";
import Button from "../../../../_components/button";
import Icon, { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";
import { UserData } from "@/app/_lib/api/user";
import { getTestUserPictureData } from "@/app/_lib/debug";
import Checkbox from "@/app/_components/checkbox";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import { useRouter } from "next/navigation";

export default function UserPage() {

  const router = useRouter();

  return (
    <div className="page">
      {/* Admin area */}
      <div className="admin-section vertical-list gap-2mm">
        <div className="horizontal-list">
          <span className="title">
            <Icon iconName={ICONS.SECURITY}></Icon>
          </span>
        </div>
        <Button iconName={ICONS.ID_CARD} onClick={()=>router.push("/admin/memberships/a")}>
          Membership manager
        </Button>
      </div>
    </div>
  );
}
