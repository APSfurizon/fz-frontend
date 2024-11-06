'use client'
import Checkbox from "@/app/_components/checkbox";
import Button from "../../../_components/button";
import { ICONS } from "../../../_components/icon";
import { useState } from "react";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import JanInput from "../../../_components/janInput";
import StatusBox from "../../../_components/statusBox";

export default function Home() {

  const [isBusy, setBusy] = useState(false);

  const [titleInput,setTitleInput] = useState("Esempio di un Titolo");

  return (
    <div className="page">
        <Button className="danger" onClick={()=>setBusy(false)} iconName={ICONS.ADD_CIRCLE}>Busy off</Button>
        <Button busy={isBusy} onClick={()=>{setBusy(true);}} iconName={ICONS.EDIT}>Busy on</Button>
        <Checkbox>Wofe</Checkbox>
        <NoticeBox theme={NoticeTheme.Success} title="Wow">It works</NoticeBox>
        <JanInput title={titleInput}></JanInput>
        <StatusBox status="room">Triple room</StatusBox>
        <StatusBox status="year">2024</StatusBox>
        <StatusBox status="open">Open</StatusBox>
        <StatusBox status="pending">Pending</StatusBox>
        <StatusBox status="rejected">Rejected</StatusBox>
    </div>
  );
}