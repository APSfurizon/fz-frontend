"use client";

import { Card, CardAction, CardDescription, CardHeader, CardTitle, Skeleton } from "@/components/common";
import { runRequest } from "@/lib/api/networking";
import {
  BookingOrderApiAction,
  calculateReservationData,
  OrderEditLinkApiAction,
  OrderRetryLinkApiAction,
  OrderStatusType,
  TicketType,
} from "@/lib/api/reservation";
import { EVENT_BANNER, EVENT_LOGO, EVENT_NAME } from "@/lib/constants";
import "@/styles/furpanel/reservation/widgets/reservationWidget.scss";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { CSSProperties, useState } from "react";
import { WidgetBaseProps } from "../types";
import QrCodeModal from "./components/qrCodeModal";

type ReservationWidgetProps = WidgetBaseProps;

export default function ReservationWidget({}: Readonly<ReservationWidgetProps>) {
  // Translation functions
  const t = useTranslations();
  const formatter = useFormatter();

  const query = useQuery({
    queryKey: ["reservation-widget"],
    queryFn: ({ signal }) => runRequest({ action: new BookingOrderApiAction(), signal }),
    staleTime: 10_000,
  });

  // Mutations

  /** The mutation triggered when the user requests to retry payment */
  const getRetryPaymentLinkMutation = useMutation({
    mutationFn: () => runRequest({ action: new OrderRetryLinkApiAction() }),
    onSuccess: (data) => {
      window.open(data.link, "_blank")?.focus();
    },
    onError: (/*data*/) => {
      // No-op
    },
  });

  /** The mutation triggered when the user requests to edit their order */
  const getEditLinkMutation = useMutation({
    mutationFn: () => runRequest({ action: new OrderEditLinkApiAction() }),
    onSuccess: (data) => {
      window.open(data.link, "_blank")?.focus();
    },
    onError: (/*data*/) => {
      // No-op
    },
  });

  /** Whenever a user submits an order transfer request */
  /*const postTransferRequest = useMutation({
    mutationFn: (data: any) => {},
  });*/

  // UI variables
  /** First render time */
  const [now] = useState(new Date());

  const pageData = calculateReservationData(query.data);
  /** Whether the current date is past the reservation editing threshold date */
  const orderEditingLocked = !pageData || pageData.editBookEndDate.getTime() - now.getTime() < 0;

  /**The formatted list of daily days the ticket includes */
  const formattedDailyDays = pageData?.dailyDays?.map((dt) => formatter.dateTime(dt, { day: "2-digit" })).join(", ");

  /** Mapping ticket type names */
  const translateTicket = (type: TicketType) => {
    switch (type) {
      case "DAILY":
        return t("furpanel.booking.items.daily_ticket");
      case "NONE":
        return t("furpanel.booking.items.none_ticket");
      case "SPONSOR":
        return t.rich("furpanel.booking.items.sponsor_ticket", {
          sponsor: (chunks) => <b className="sponsor-highlight">{chunks}</b>,
        });
      case "SUPER_SPONSOR":
        return t.rich("furpanel.booking.items.super_sponsor_ticket", {
          supersponsor: (chunks) => <b className="super-sponsor-highlight">{chunks}</b>,
        });
      case "ULTRA_SPONSOR":
        return t.rich("furpanel.booking.items.ultra_sponsor_ticket", {
          ultrasponsor: (chunks) => <b className="ultra-sponsor-highlight">{chunks}</b>,
        });
      default:
        console.warn("No translation for ticket type", type);
        return type;
    }
  };

  /** Mapping order status types */
  const translateOrderStatus = (type: OrderStatusType) => {
    switch (type) {
      case "CANCELED":
        return t("common.order_status.CANCELED");
      case "EXPIRED":
        return t("common.order_status.EXPIRED");
      case "PAID":
        return t("common.order_status.PAID");
      case "PENDING":
        return t("common.order_status.PENDING");
      default:
        console.warn("No translation for order status type", type);
        return type;
    }
  };

  const mapOrderStatusToBadgeVariant = (type: OrderStatusType) => {
    switch (type) {
      case "CANCELED":
      case "EXPIRED":
        return "destructive";
      case "PAID":
        return "default";
      case "PENDING":
        return "outline";
      default:
        console.warn("No badge variant mapping for order status type", type);
        return "default";
    }
  };

  /** The venue's location on google maps */
  const geoLink = `https://www.google.com/maps/search/?api=1&query=${query.data?.geoLatitude},${query.data?.geoLongitude}`;
  const showGeoData = query.data?.geoLatitude && query.data?.geoLongitude;

  const loading = !query?.data || query.isFetching || query.isError;

  return (
    <>
      <div className="reservation-widget">
        <h1>{t("furpanel.booking.your_booking")}</h1>
        <Card
          className="reservation-card"
          style={{ "--reservation-card-background-url": `url('${EVENT_BANNER}')` } as CSSProperties}
        >
          <CardHeader>
            <CardTitle>
              {EVENT_LOGO && (
                <Image
                  unoptimized
                  className="event-logo"
                  alt={t("furpanel.booking.event_logo")}
                  src={EVENT_LOGO}
                  width={80}
                  height={80}
                />
              )}
              {!EVENT_LOGO && <h2>{EVENT_NAME}</h2>}
            </CardTitle>
            <CardDescription>
              {loading ? (
                <>
                  <Skeleton className="h-5 w-30" />
                  <Skeleton className="h-5 w-20" />
                </>
              ) : (
                <>
                  <p className="text-secondary drop-shadow-l text-2xl font-medium">
                    {translateTicket(pageData!.ticketType)}
                  </p>
                  <p className="text-secondary drop-shadow-l font-mono">#{query.data.order.code}</p>
                </>
              )}
            </CardDescription>
            <CardAction>
              {loading ? <Skeleton className="h-9 w-9.5" /> : <QrCodeModal secret={query.data.order.checkinSecret} />}
            </CardAction>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}
