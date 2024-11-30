'use client'
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import Button from "../../../../_components/button";
import { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";
import useTitle from "@/app/_lib/api/hooks/useTitle";

export default function BadgePage() {
  useTitle("Badge");
  //const {showModal} = useModalUpdate();
  return (
    <div className="page"></div>
  );
}
