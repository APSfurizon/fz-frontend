'use client'
import UserPicture from "@/app/_components/userPicture";
import Button from "../../../_components/button";
import { ICONS } from "../../../_components/icon";
import { useEffect, useState } from "react";
import { UserPictureData } from "@/app/_lib/api/user";
import { getTestUserPictureData } from "@/app/_lib/debug";
import Checkbox from "@/app/_components/checkbox";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";

export default function UserPage() {

  return (
    <div>
      <NoticeBox theme={NoticeTheme.Success} title="Wow">It works</NoticeBox>
    </div>
  );
}
