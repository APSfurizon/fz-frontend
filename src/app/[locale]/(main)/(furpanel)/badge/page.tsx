'use client'
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import Button from "../../../../_components/button";
import { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";

export default function BadgePage() {

  const [isBusy, setBusy] = useState(false);
  const {showModal} = useModalUpdate();
  useEffect (()=> {
    showModal("ciao", <span>Ciao</span>);
  }, []);
  return (
    <div className="page"></div>
  );
}
