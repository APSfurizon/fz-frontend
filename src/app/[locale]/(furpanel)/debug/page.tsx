'use client'
import Checkbox from "@/app/_components/checkbox";
import Button from "../../../_components/button";
import { ICONS } from "../../../_components/icon";
import { useState } from "react";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";

export default function Home() {

  const [isBusy, setBusy] = useState(false);

  return (
    <div className="page">
        <Button className="danger" onClick={()=>setBusy(false)} iconName={ICONS.ADD_CIRCLE}>Busy off</Button>
        <Button busy={isBusy} onClick={()=>{setBusy(true);}} iconName={ICONS.EDIT}>Busy on</Button>
        <Checkbox>Wofe</Checkbox>
        <NoticeBox theme={NoticeTheme.Success} title="Wow">It works</NoticeBox>
    </div>
  );
}
