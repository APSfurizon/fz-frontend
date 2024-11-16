"use client"
import UserPicture from "@/app/_components/userPicture";
import Button from "../../../_components/button";
import Icon, { ICONS } from "../../../_components/icon";
import { useEffect, useState } from "react";
import { UserPictureData } from "@/app/_lib/api/user";
import Checkbox from "@/app/_components/checkbox";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations('furpanel');
  return (
    <div className="page">
      <div className="center large title vertical-align-middle">
        <Icon className="x-large" style={{marginRight: '.1em'}} iconName={ICONS.CONTEXTUAL_TOKEN}></Icon>
        <span>{t.rich('home.header', {
          highlighted: (chunks) => <b className="highlight">{chunks}</b>
        })}</span>
      </div>
      <span className="spacer"></span>
    </div>
  );
}
