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
        <div style={{display: 'flex'}}>
          <div style={{flexDirection:'column',marginRight:5}}>
            <JanInput title={"Text"}/>
            <JanInput isNumber title={"Number"}/>
          </div>
          <div style={{flexDirection:'column',marginRight:5}}>
            <JanInput isPassword title={"Password"} placeholder="Insert password"/>
            <JanInput title={"Disabled"} disabled placeholder="Not editable"/>
          </div>
          <div>
            <JanInput title={"Loading"} busy/>
            <JanInput title={"Error"} hasError/>
          </div>
        </div>
        <StatusBox>Triple room</StatusBox>
        <StatusBox status="warning">2024</StatusBox>
        <StatusBox status="success">Open</StatusBox>
        <StatusBox status="normal">Pending</StatusBox>
        <StatusBox status="error">Rejected</StatusBox>
    </div>
  );
}