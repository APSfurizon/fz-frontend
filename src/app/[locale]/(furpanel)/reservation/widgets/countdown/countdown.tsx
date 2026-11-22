"use client";
import { Alert, AlertDescription, AlertTitle, Button, ButtonGroup, toast } from "@/components/common";
import ErrorMessage from "@/components/errorMessage";
import Icon from "@/components/icon";
import FpButton from "@/components/input/fpButton";
import { ApiErrorResponse } from "@/lib/api/networking";
import { runRequest } from "@/lib/api/networking/main";
import {
  BookingOrderApiAction,
  calculateReservationData,
  ConfirmMembershipDataApiAction,
  ShopLinkApiAction,
} from "@/lib/api/reservation";
import { EVENT_BANNER, EVENT_LOGO } from "@/lib/constants";
import { getCountdown } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircleIcon, Clock, UserCheck, UserPen } from "lucide-react";
import { useFormatter, useNow, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { WidgetBaseProps } from "../types";

type CountDownWidgetProps = WidgetBaseProps;

// TODO: Fullscreen button on the countdown
export default function Countdown({}: Readonly<CountDownWidgetProps>) {
  const t = useTranslations();
  const formatter = useFormatter();
  const router = useRouter();
  const now = useNow({ updateInterval: 1000 });

  const query = useQuery({
    queryKey: ["reservation-widget"],
    queryFn: ({ signal }) =>
      runRequest({ action: new BookingOrderApiAction(), signal }).then((result) => calculateReservationData(result)),
    staleTime: 10_000,
  });

  const openDiff = Math.max((query.data?.bookingStartDate.getTime() ?? 0) - now.getTime(), 0);
  const countdown = getCountdown(openDiff);
  const isOpen = openDiff <= 0;

  const bookMutation = useMutation({
    mutationFn: () => runRequest({ action: new ShopLinkApiAction() }),
    onSuccess(data) {
      router.push(data.link);
    },
    onError(error) {
      toast.add({
        id: "bookingErrorToast",
        description: <ErrorMessage error={error as ApiErrorResponse} />,
      });
    },
  });

  const confirmUserdataMutation = useMutation({
    mutationFn: () => runRequest({ action: new ConfirmMembershipDataApiAction() }),
    onSuccess: () => query.refetch(),
    onError(error) {
      toast.add({
        id: "confirmUserdataErrorToast",
        type: "error",
        description: <ErrorMessage error={error as ApiErrorResponse} />,
      });
    },
  });

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row">
        {!isOpen && (
          <Alert title={t("furpanel.booking.messages.countdown.title")}>
            <Clock />
            <AlertTitle>{t("furpanel.booking.messages.countdown.title")}</AlertTitle>
            <AlertDescription>
              {t("furpanel.booking.messages.countdown.description", {
                openingDate: formatter.dateTime(query.data!.bookingStartDate),
              })}
            </AlertDescription>
          </Alert>
        )}
        {query.data && query.data.shouldUpdateInfo && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{t("furpanel.booking.messages.review_info.title")}</AlertTitle>
            <AlertDescription>
              {t("furpanel.booking.messages.review_info.description")}
              <ButtonGroup className="mt-3 flex w-full">
                <div className="grow"></div>
                <Button onClick={() => router.push("/user")}>
                  <UserPen />
                  {t("furpanel.booking.actions.review_info")}
                </Button>
                <Button disabled={confirmUserdataMutation.isPending} onClick={() => confirmUserdataMutation.mutate()}>
                  <UserCheck />
                  {t("furpanel.booking.actions.confirm_info")}
                </Button>
              </ButtonGroup>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div
        className="countdown-container mt-3 rounded-md"
        style={{ backgroundImage: `url(${EVENT_BANNER})`, backgroundSize: "cover" }}
      >
        {EVENT_LOGO && (
          <Image
            unoptimized
            className="event-logo"
            alt={t("furpanel.booking.event_logo")}
            src={EVENT_LOGO}
            width={120}
            height={120}
            style={{ width: "auto", height: "auto" }}
          />
        )}
        {/* Countdown view */}
        {!isOpen && query.data?.showCountdown && !query.data?.hasOrder && countdown ? (
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
          query.data &&
          !query.data.hasOrder && (
            <div className="action-container">
              <FpButton
                className="action-button book-now"
                busy={bookMutation.isPending}
                disabled={query.data?.shouldUpdateInfo}
                onClick={() => bookMutation.mutate()}
              >
                <div className="vertical-list align-items-center">
                  <span className="title large">
                    {query.data?.shouldUpdateInfo && <Icon style={{ marginRight: ".2em" }} icon="LOCK" />}
                    {t("furpanel.booking.book_now")}
                  </span>
                  {query.data?.shouldUpdateInfo && (
                    <>
                      <span className="text-s font-serif">({t("furpanel.booking.review_info_first")})</span>
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
