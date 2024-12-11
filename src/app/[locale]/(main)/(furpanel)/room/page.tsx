'use client'
import { runRequest } from "@/app/_lib/api/global";
import Button from "../../../../_components/button";
import { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useFormatter, useTranslations } from "next-intl";

export default function RoomPage() {
  const t = useTranslations("furpanel");
  const tcommon = useTranslations("common");
  const formatter = useFormatter();
  useTitle(t("room.title"));
  const [loading, setLoading] = useState(false);
  
  /*useEffect(()=>{
    setLoading(true);
    runRequest(new BookingOrderApiAction())
    .then((result)=>setBookingData(result as BookingOrderResponse))
    .catch((err)=>showModal(
        tcommon("error"), 
        <span className='error'>{getErrorBody(err) ?? tcommon("unknown_error")}</span>
    )).finally(()=>setLoading(false));
  }, []);*/

  return (
    <div className="page">
      <span className="title medium">{t("room.your_room")}</span>
    </div>
  );
}
