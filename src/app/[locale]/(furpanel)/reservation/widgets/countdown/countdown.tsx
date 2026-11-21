"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/common";
import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import Icon from "@/components/icon";
import FpButton from "@/components/input/fpButton";
import { ApiErrorResponse } from "@/lib/api/networking";
import { runRequest } from "@/lib/api/networking/main";
import { BookingOrderUiData, ShopLinkApiAction } from "@/lib/api/reservation";
import { EVENT_BANNER, EVENT_LOGO } from "@/lib/constants";
import { getCountdown } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

// TODO: Fullscreen button on the countdown
export default function Countdown({ data }: Readonly<{ data: BookingOrderUiData }>) {
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
    runRequest({ action: new ShopLinkApiAction() })
      .then((result) => router.push(result.link))
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => setActionLoading(false));
  };

  return (
    <>
      {!isOpen && !data.hasOrder && (
        <Alert title={t("furpanel.booking.messages.countdown.title")}>
          <Clock />
          <AlertTitle>{t("furpanel.booking.messages.countdown.title")}</AlertTitle>
          <AlertDescription>
            {t("furpanel.booking.messages.countdown.description", {
              openingDate: formatter.dateTime(data.bookingStartDate),
            })}
          </AlertDescription>
        </Alert>
      )}
      <div
        className="countdown-container mt-3 rounded-md"
        style={{ backgroundImage: `url(${EVENT_BANNER})`, backgroundSize: "cover" }}
      >
        <img className="event-logo" alt={t("furpanel.booking.event_logo")} src={EVENT_LOGO} />
        {/* Countdown view */}
        {!isOpen && data.showCountdown && !data.hasOrder && countdown ? (
          <p className="countdown title bold title large center">
            {countdown[0] > 0
              ? t.rich("furpanel.booking.countdown_days", { days: countdown[0] })
              : t.rich("furpanel.booking.countdown_clock", {
                  hours: countdown[1],
                  minutes: countdown[2],
                  seconds: countdown[3],
                  b: (chunks) => <b className="small">{chunks}</b>,
                  mono: (chunks) => <span className="font-mono">{chunks}</span>,
                })}
          </p>
        ) : (
          data &&
          !data.hasOrder && (
            <div className="action-container">
              <FpButton
                className="action-button book-now"
                busy={actionLoading}
                disabled={data?.shouldUpdateInfo}
                onClick={requestShopLink}
              >
                <div className="vertical-list align-items-center">
                  <span className="title large">
                    {data?.shouldUpdateInfo && <Icon style={{ marginRight: ".2em" }} icon="LOCK" />}
                    {t("furpanel.booking.book_now")}
                  </span>
                  {data?.shouldUpdateInfo && (
                    <>
                      <span className="descriptive tiny">({t("furpanel.booking.review_info_first")})</span>
                    </>
                  )}
                </div>
              </FpButton>
            </div>
          )
        )}
      </div>
    </>
  );
}
