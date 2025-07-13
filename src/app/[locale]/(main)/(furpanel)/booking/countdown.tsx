"use client"
import Button from "@/components/input/button";
import { useModalUpdate } from "@/components/context/modalProvider";
import Icon, { ICONS } from "@/components/icon";
import LoadingPanel from "@/components/loadingPanel";
import ModalError from "@/components/modalError";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { BookingOrderUiData, ShopLinkApiAction } from "@/lib/api/booking";
import { runRequest } from "@/lib/api/global";
import { EVENT_BANNER, EVENT_LOGO } from "@/lib/constants";
import { getCountdown } from "@/lib/utils";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Countdown({ data }: Readonly<{ data?: BookingOrderUiData }>) {
    const t = useTranslations();
    const formatter = useFormatter();
    const router = useRouter();
    const now = useNow({ updateInterval: 1000 });
    const { showModal } = useModalUpdate();

    const [actionLoading, setActionLoading] = useState<boolean>(false);

    const openDiff = Math.max((data?.bookingStartDate.getTime() ?? 0) - now.getTime(), 0);
    const countdown = getCountdown(openDiff);
    const isOpen = openDiff <= 0;

    /**UI Events */
    const requestShopLink = () => {
        if (actionLoading) return;
        setActionLoading(true);
        runRequest(new ShopLinkApiAction())
            .then((result) => router.push(result.link))
            .catch((err) => showModal(
                t("common.error"),
                <ModalError error={err} translationRoot="furpanel" translationKey="booking.errors"></ModalError>
            )).finally(() => setActionLoading(false));
    }

    return data ? <>
        {!isOpen && !data.hasOrder && (
            <NoticeBox title={t("furpanel.booking.messages.countdown.title")} theme={NoticeTheme.FAQ}>
                {t("furpanel.booking.messages.countdown.description",
                    { openingDate: formatter.dateTime(data.bookingStartDate) })}
            </NoticeBox>
        )}
        <div className={`countdown-container rounded-s ${data.hasOrder ? "minimized" : ""}`}
            style={{ backgroundImage: `url(${EVENT_BANNER})`, backgroundSize: 'cover' }}>
            <img className="event-logo"
                alt={t("furpanel.booking.event_logo")}
                src={EVENT_LOGO}/>
            {/* Countdown view */}
            {!isOpen && data?.showCountdown && !data.hasOrder && countdown
                ? <p className="countdown title bold title large rounded-s center">
                    {countdown[0] > 0
                        ? t.rich("furpanel.booking.coundown_days", { days: countdown[0] })
                        : t.rich("furpanel.booking.coundown_clock", { 
                            hours: countdown[1],
                            minutes: countdown[2],
                            seconds: countdown[3],
                            b: (chunks) => <b className="small">{chunks}</b> 
                        })
                    }
                </p>
                : data && !data.hasOrder && <div className="action-container">
                    <Button className="action-button book-now"
                        busy={actionLoading}
                        disabled={data?.shouldUpdateInfo}
                        onClick={requestShopLink}>
                        <div className="vertical-list flex-vertical-center">
                            <span className="title large">
                                {data?.shouldUpdateInfo && 
                                    <Icon style={{ marginRight: ".2em" }} iconName={ICONS.LOCK}/>}
                                {t("furpanel.booking.book_now")}
                            </span>
                            {data?.shouldUpdateInfo && <>
                                <span className="descriptive tiny">
                                    ({t("furpanel.booking.review_info_first")})
                                </span>
                            </>}
                        </div>
                    </Button>
                </div>
            }
        </div>
    </> : <LoadingPanel />;
}