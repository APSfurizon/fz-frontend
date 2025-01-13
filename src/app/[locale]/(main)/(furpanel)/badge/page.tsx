'use client'
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import Button from "../../../../_components/button";
import Icon, { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useTranslations } from "next-intl";

export default function BadgePage() {
  const tcommon = useTranslations("common");
  //const {showModal} = useModalUpdate();

  useTitle("Badge");

  return (
    <div className="page flex-vertical-center">
      <span className="title gap-2mm horizontal-list flex-vertical-center">
        <Icon className="x-large" iconName={ICONS.CONSTRUCTION}></Icon>
        {tcommon("coming_soon")}
      </span>
    </div>
  );
}
