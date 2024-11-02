'use client'
import Button from "../../../_components/button";
import { ICONS } from "../../../_components/icon";
import { useState } from "react";

export default function Home() {

  const [isBusy, setBusy] = useState(false);

  return (
    <div>
      <main>
        <Button className="danger" onClick={()=>setBusy(false)} iconName={ICONS.ADD_CIRCLE}>Busy off</Button>
        <Button busy={isBusy} onClick={()=>{setBusy(true); console.log('aaoa');}} iconName={ICONS.EDIT}>Close</Button>
        
      </main>
    </div>
  );
}
