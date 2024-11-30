'use client'
import Checkbox from "@/app/_components/checkbox";
import Button from "@/app/_components/button";
import { ICONS } from "../../../../_components/icon";
import { useState } from "react";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";
import JanInput from "@/app/_components/janInput";
import StatusBox from "@/app/_components/statusBox";
import AutoInput from "@/app/_components/autoInput";
import DataForm from "@/app/_components/dataForm";
import Modal from "@/app/_components/modal";
import { AutoInputDebugUserManager } from "@/app/_lib/components/autoInput";
import Upload from "@/app/_components/upload";

export default function Home() {

  const [isBusy, setBusy] = useState(false);

  const [isOpen, setOpen] = useState(false);

  const [titleInput, setTitleInput] = useState("Esempio di un Titolo");

  return (
    <div className="page">
      <div className="container">
        <Upload></Upload>
      </div>
      <Button className="danger" onClick={()=>setBusy(false)} iconName={ICONS.ADD_CIRCLE}>Busy off</Button>
      <Button busy={isBusy} onClick={()=>{setBusy(true);}} iconName={ICONS.EDIT}>Busy on</Button>
      <Checkbox>Wofe</Checkbox>
      <NoticeBox theme={NoticeTheme.Success} title="Wow">It works</NoticeBox>
      <div style={{display: 'flex'}}>
        <div style={{flexDirection:'column',marginRight:5}}>
          <JanInput label={titleInput} onChange={(e)=>setTitleInput(e.target.value)}/>
          <JanInput inputType="number" label={"Number"}/>
        </div>
        <div style={{flexDirection:'column',marginRight:5}}>
          <JanInput inputType="password" label={"Password"} placeholder="Insert password"/>
          <JanInput label={"Disabled"} disabled placeholder="Not editable"/>
        </div>
        <div>
          <JanInput label={"Loading"} busy/>
          <JanInput label={"Error"} hasError/>
        </div>
      </div>
      <div className="horizontal-list gap-2mm">
      <AutoInput manager={new AutoInputDebugUserManager()} multiple={true} max={5} label={"Invite in room"} placeholder="Search user by name" style={{maxWidth: "500px"}}/>
      <JanInput label={"Error"} hasError/>
      </div>
      <StatusBox>Triple room</StatusBox>
      <StatusBox status="warning">2024</StatusBox>
      <StatusBox status="success">Open</StatusBox>
      <StatusBox status="normal">Pending</StatusBox>
      <StatusBox status="error">Rejected</StatusBox>
      <Modal title="A title" open={isOpen} onClose={()=>setOpen(false)}>
        <span>a modal</span>
      </Modal>
      <Button onClick={()=>{setOpen(true);}} iconName={ICONS.BED}>Modal</Button>
    </div>
  );
}