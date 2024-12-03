'use client'
import { useModalUpdate } from "@/app/_lib/context/modalProvider";
import Button from "../../../../_components/button";
import { ICONS } from "../../../../_components/icon";
import { useEffect, useState } from "react";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { useTranslations, useFormatter, useNow } from "next-intl";
import "../../../../styles/furpanel/booking.css";
import { EVENT_BANNER } from "@/app/_lib/constants";
import NoticeBox, { NoticeTheme } from "@/app/_components/noticeBox";

export default function BookingPage() {
    const t = useTranslations("furpanel");
    const formatter = useFormatter();
    const now = useNow({updateInterval: 1000});
    useTitle(t("booking.title"));
    const {showModal} = useModalUpdate();
    const [deadline, setDeadline] = useState<String>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const date = new Date("2025-01-13T15:30:00.000Z");

    return <>
        <div className="page">
            <>
            <div className="countdown-container rounded-s" style={{backgroundImage: `url(${EVENT_BANNER})`}}>
                <p className="countdown title rounded-s">
                    
                </p>
            </div>
            <NoticeBox title={t("booking.countdown")} theme={NoticeTheme.FAQ}>
                {t("booking.countdown_desc", {openingDate: formatter.dateTime(date)})}
            </NoticeBox>
            </>
            <p>{t("booking.your_booking")}</p>

        </div>
    </>;
}
