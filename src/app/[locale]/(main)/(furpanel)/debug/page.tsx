'use client'
import Checkbox from "@/components/input/checkbox";
import Button from "@/components/input/button";
import { useState } from "react";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import FpInput from "@/components/input/fpInput";
import StatusBox from "@/components/statusBox";
import Modal from "@/components/modal";
//import { AutoInputDebugUserManager } from "@/app/_lib/components/autoInput";
import Upload from "@/components/input/upload";
import FpSelect from "@/components/input/fpSelect";
import { SelectGroup, SelectItem } from "@/lib/components/fpSelect";
import { inputEntityCodeExtractor } from "@/lib/components/input";

export default function Home() {

  const [isBusy, setBusy] = useState(false);

  const [isOpen, setOpen] = useState(false);

  const [titleInput, setTitleInput] = useState("Esempio di un Titolo");

  const group1 = new SelectGroup([
    new SelectItem(1, "aa", "aLetter", "pencil", undefined, undefined, { "it": "ciao", "en": "Hello" }),
    new SelectItem(2, "bb", "bLetter", "rocket", undefined, undefined, { "it": "razzo", "en": "Rocket" })
  ], "gouppone", { "it": "Gruppo", "en": "Group" })
  const item3 = new SelectItem(3, "cc", "cLetter", "book", undefined, undefined, { "it": "Libro", "en": "Book" });

  const selectItems: (SelectItem | SelectGroup)[] = [
    group1, item3
  ]

  return (
    <div className="page">
      <div className="container">
        <Upload busy={false} label="Profile picture" requireCrop={true} cropAspectRatio="square"></Upload>
      </div>
      <Button className="danger" onClick={() => setBusy(false)} iconName={"ADD_CIRCLE"}>Busy off</Button>
      <Button busy={isBusy} onClick={() => { setBusy(true); }} iconName={"EDIT"}>Busy on</Button>
      <Checkbox>Wofe</Checkbox>
      <Checkbox busy={isBusy}>Wofe</Checkbox>
      <NoticeBox theme={NoticeTheme.Success} title="Wow">It works</NoticeBox>
      <div style={{ display: 'flex' }}>
        <div style={{ flexDirection: 'column', marginRight: 5 }}>
          <FpInput label={titleInput} onChange={(e) => setTitleInput(e.target.value)} />
          <FpInput inputType="number" label={"Number"} />
        </div>
        <div style={{ flexDirection: 'column', marginRight: 5 }}>
          <FpInput inputType="password" label={"Password"} placeholder="Insert password" />
          <FpInput label={"Disabled"} disabled placeholder="Not editable" />
        </div>
        <div>
          <FpInput label={"Loading"} busy />
          <FpInput label={"Error"} hasError />
        </div>
      </div>
      <div className="horizontal-list gap-2mm">
        {/* <AutoInput manager={new AutoInputDebugUserManager()} multiple={true} max={5} label={"Invite in room"} placeholder="Search user by name" style={{maxWidth: "500px"}}/> */}
        <FpInput label={"Error"} hasError />
      </div>
      <StatusBox>Triple room</StatusBox>
      <StatusBox status="warning">2024</StatusBox>
      <StatusBox status="success">Open</StatusBox>
      <StatusBox status="normal">Pending</StatusBox>
      <StatusBox status="error">Rejected</StatusBox>
      <Modal title="A title" open={isOpen} onClose={() => setOpen(false)}>
        <span>a modal</span>
      </Modal>
      <Button onClick={() => { setOpen(true); }} iconName={"BED"}>Modal</Button>
      <FpSelect fieldName="d" items={selectItems} hasError label="WOW" placeholder="select" itemExtractor={inputEntityCodeExtractor} required></FpSelect>
    </div>
  );
}