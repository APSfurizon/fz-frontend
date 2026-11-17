"use client";

import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  Skeleton,
} from "@/components/common";
import { runRequest } from "@/lib/api/networking";
import {
  Board,
  BookingOrderApiAction,
  calculateReservationData,
  ExtraDaysType,
  OrderEditLinkApiAction,
  OrderRetryLinkApiAction,
  OrderStatusType,
  SponsorshipType,
  TicketType,
} from "@/lib/api/reservation";
import { EVENT_BANNER, EVENT_LOGO, EVENT_MAIN_LOCATION_NAME, EVENT_NAME } from "@/lib/constants";
import { translateNullable } from "@/lib/translations";
import "@/styles/furpanel/reservation/widgets/reservationWidget.scss";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BedDouble,
  CalendarPlus,
  ConciergeBell,
  Edit,
  ExternalLink,
  Gift,
  HouseArrowRight,
  IdCard,
  MapPinned,
  RefreshCcw,
  TicketSlash,
  Utensils,
} from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { CSSProperties, useState } from "react";
import { WidgetBaseProps } from "../types";
import QrCodeModal from "./components/qrCodeModal";
import TransferOrderModal from "./components/transferOrderModal";

type ReservationWidgetProps = WidgetBaseProps;

export default function ReservationWidget({}: Readonly<ReservationWidgetProps>) {
  // Translation functions
  const t = useTranslations();
  const locale = useLocale();
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

  // UI variables
  /** First render time */
  const [now] = useState(new Date());

  const pageData = calculateReservationData(query.data);
  /** Whether the current date is past the reservation editing threshold date */
  const orderEditingLocked = !pageData || pageData.editBookEndDate.getTime() - now.getTime() < 0;

  /**The formatted list of daily days the ticket includes */
  const formattedDailyDays = pageData?.dailyDays
    ?.map((dt) => formatter.dateTime(dt, { day: "2-digit", month: "short" }))
    .join(", ");

  const allDaysRange =
    pageData?.hasOrder && query.data?.order?.noRoomTicketFromDate && query.data?.order?.noRoomTicketToDate
      ? formatter.dateTimeRange(
          new Date(query.data.order.noRoomTicketFromDate),
          new Date(query.data.order.noRoomTicketToDate),
          { dateStyle: "medium" }
        )
      : undefined;

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

  const translateSponsorship = (type: SponsorshipType) => {
    switch (type) {
      case "NONE":
        return <></>;
      case "SPONSOR":
        return <b className="sponsor-highlight">{t("common.sponsorships.sponsor")}</b>;
      case "SUPER_SPONSOR":
        return <b className="super-sponsor-highlight">{t("common.sponsorships.super_sponsor")}</b>;
      case "ULTRA_SPONSOR":
        return <b className="ultra-sponsor-highlight">{t("common.sponsorships.ultra_sponsor")}</b>;
      default:
        console.warn("No translation for sponsorship type", type);
        return type;
    }
  };

  const translateExtraDays = (type: ExtraDaysType) => {
    switch (type) {
      case "NONE":
        return "";
      case "EARLY":
        return t("furpanel.booking.items.extra_days_EARLY");
      case "LATE":
        return t("furpanel.booking.items.extra_days_LATE");
      case "BOTH":
        return t("furpanel.booking.items.extra_days_BOTH");
      default:
        console.warn("No translation for extra days type", type);
        return type;
    }
  };

  const translateBoard = (type: Board) => {
    switch (type) {
      case Board.NONE:
        return "";
      case Board.HALF:
        return t("furpanel.booking.items.board_HALF");
      case Board.FULL:
        return t("furpanel.booking.items.board_FULL");
      default:
        console.warn("No translation for board type", type);
        return type;
    }
  };

  /** The venue's location on google maps */
  const geoLink = `https://www.google.com/maps/search/?api=1&query=${EVENT_MAIN_LOCATION_NAME},${query.data?.geoLatitude},${query.data?.geoLongitude}`;
  const hasGeoData = query.data?.geoLatitude && query.data?.geoLongitude;

  const hasExtraDays = query.data?.order && query.data.order.extraDays !== "NONE";

  const hasRoom = query.data?.order && query.data.order.room;

  const hasBoard = query.data?.order && query.data.order.board && query.data.order.board !== Board.NONE;

  const hasSponsor = query.data?.order && query.data.order.sponsorship !== "NONE";

  const loading = !query?.data?.order || query.isPending || query.isError;

  return (
    <>
      <div className="reservation-widget">
        <h1 className="font-heading mb-3 text-xl font-bold">{t("furpanel.booking.your_booking")}</h1>
        <Card
          className="reservation-card"
          style={{ "--reservation-card-background-url": `url('${EVENT_BANNER}')` } as CSSProperties}
        >
          <CardHeader className="reservation-card__header">
            <CardTitle>
              {EVENT_LOGO && (
                <Image
                  unoptimized
                  className="event-logo"
                  alt={t("furpanel.booking.event_logo")}
                  src={EVENT_LOGO}
                  width={80}
                  height={80}
                  style={{ height: "auto" }}
                />
              )}
              {!EVENT_LOGO && <h2>{EVENT_NAME}</h2>}
            </CardTitle>
            <CardDescription>
              {loading ? (
                <>
                  <Skeleton className="h-6.5 w-30" />
                  <Skeleton className="h-5 w-20" />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <p className="text-secondary drop-shadow-l text-l xs:text-xl font-medium sm:text-2xl">
                      {translateTicket(pageData!.ticketType)}
                    </p>
                    <Badge variant={mapOrderStatusToBadgeVariant(query.data.order.orderStatus)}>
                      {translateOrderStatus(query.data.order.orderStatus)}
                    </Badge>
                  </div>
                  <p className="text-secondary drop-shadow-l font-mono">#{query.data.order.code}</p>
                </>
              )}
            </CardDescription>
            <CardAction>
              {loading ? (
                <Skeleton className="h-9 w-9.5" />
              ) : (
                <ButtonGroup orientation="horizontal" className="gap-1">
                  {/** Retry payment button */}
                  {pageData?.shouldRetry && (
                    <Button
                      title={t("furpanel.booking.retry_payment")}
                      disabled={getRetryPaymentLinkMutation.isPending}
                      className="text-foreground bg-yellow-400"
                      variant="secondary"
                      onClick={() => getRetryPaymentLinkMutation.mutate()}
                    >
                      <RefreshCcw />
                      {t("furpanel.booking.retry_payment")}
                    </Button>
                  )}
                  {!orderEditingLocked && (
                    <Button
                      title={t("furpanel.booking.edit_booking")}
                      disabled={getEditLinkMutation.isPending}
                      onClick={() => getEditLinkMutation.mutate()}
                    >
                      <Edit />
                    </Button>
                  )}
                  <QrCodeModal secret={query.data.order.checkinSecret} />
                </ButtonGroup>
              )}
            </CardAction>
          </CardHeader>
          <CardContent className="mt-6">
            {/** Reservation overview information */}
            <div className="reservation-card__overview flex flex-col gap-3">
              <h2 className="font-heading text-l mb-3 font-bold">{t("furpanel.booking.information.title")}</h2>
              <div className="flex flex-col gap-3 sm:flex-row">
                {query.data?.order.checkinDate && (
                  <Item variant="outline">
                    <ItemMedia>
                      <ConciergeBell />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{t("furpanel.booking.information.check_in_date")}</ItemTitle>
                      <ItemDescription>
                        {formatter.dateTime(new Date(query.data.order.checkinDate), {
                          dateStyle: "full",
                        })}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                )}
                {query.data?.order.checkoutDate && (
                  <Item variant="outline">
                    <ItemMedia>
                      <HouseArrowRight />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{t("furpanel.booking.information.check_out_date")}</ItemTitle>
                      <ItemDescription>
                        {formatter.dateTime(new Date(query.data.order.checkoutDate), {
                          dateStyle: "full",
                        })}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                )}
              </div>
              <div className="flex flex-row gap-3">
                {hasGeoData && (
                  <Item variant="outline">
                    <ItemMedia>
                      <MapPinned />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{t("furpanel.booking.information.convention_venue")}</ItemTitle>
                      <ItemDescription>
                        <Link href={geoLink} className="flex items-center gap-1">
                          {EVENT_MAIN_LOCATION_NAME}
                          <ExternalLink size={16} />
                        </Link>
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                )}
              </div>
            </div>
            {/** Reservation items */}
            <div className="reservation-card__items flex flex-col gap-3">
              <h2 className="font-heading text-l mb-3 font-bold">
                {t("furpanel.booking.items.included_with_your_ticket")}
              </h2>
              {/** Daily days */}
              {pageData?.isDaily && (
                <Item variant="outline">
                  <ItemMedia>
                    <TicketSlash />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{t("furpanel.booking.items.daily_ticket")}</ItemTitle>
                    <ItemDescription>
                      {t("furpanel.booking.items.daily_days", { days: formattedDailyDays ?? "" })}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              )}
              {hasSponsor && (
                <Item variant="outline">
                  <ItemMedia>
                    <Gift />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      <span>
                        {t.rich("furpanel.booking.items.sponsorship_gadgets.title", {
                          sponsortype: () => translateSponsorship(query.data!.order.sponsorship),
                        })}
                      </span>
                    </ItemTitle>
                    <ItemDescription>{t("furpanel.booking.items.sponsorship_gadgets.description")}</ItemDescription>
                  </ItemContent>
                </Item>
              )}
              {query.data?.hasActiveMembershipForEvent && (
                <Item variant="outline">
                  <ItemMedia>
                    <IdCard />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{t("furpanel.booking.items.membership_card")}</ItemTitle>
                  </ItemContent>
                </Item>
              )}
              {hasExtraDays && (
                <Item variant="outline">
                  <ItemMedia>
                    <CalendarPlus />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{t("furpanel.booking.items.extra_days")}</ItemTitle>
                    <ItemDescription>{translateExtraDays(query.data!.order.extraDays)}</ItemDescription>
                  </ItemContent>
                </Item>
              )}
              {hasRoom && (
                <Item variant="outline">
                  <ItemMedia>
                    <BedDouble />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      {translateNullable(query.data!.order.room.roomTypeNames, locale) ??
                        t("furpanel.booking.items.room")}
                    </ItemTitle>
                    <ItemDescription>
                      {t("furpanel.booking.items.room_capacity", {
                        capacity: query.data!.order.room.roomCapacity,
                      })}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              )}
              {hasBoard && (
                <Item variant="outline">
                  <ItemMedia>
                    <Utensils />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{translateBoard(query.data!.order.board)}</ItemTitle>
                  </ItemContent>
                </Item>
              )}
            </div>
          </CardContent>
          <CardFooter>
            {/** Transfer order */}
            <ButtonGroup>
              {query.data?.exchangeSupported && query.data.canExchange && <TransferOrderModal />}
            </ButtonGroup>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
