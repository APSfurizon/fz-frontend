"use client"
import UserPicture from "@/app/_components/userPicture";
import Button from "../../../../_components/button";
import Icon, { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";
import { UserData } from "@/app/_lib/api/user";
import Checkbox from "@/app/_components/checkbox";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations('furpanel');
  return (
    <div className="page">
      <div className="large title horizontal-list flex-vertical-center flex-center">
        <Icon className="x-large" style={{marginRight: '.1em'}} iconName={ICONS.CONTEXTUAL_TOKEN}></Icon>
        <span>{t.rich('home.header', {
          highlighted: (chunks) => <b className="highlight">{chunks}</b>
        })}</span>
      </div>
      <span className="spacer"></span>
    </div>
  );
}
