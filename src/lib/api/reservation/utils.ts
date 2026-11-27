import { StatusBoxStyle } from "@/components/statusBox";
import { Translator } from "@/lib/api/types";
import { Logo, QRCodeOptions } from "next-qrcode/dist/useQRCode";
import {
  Board,
  BookingOrderResponse,
  BookingOrderUiData,
  BookingTicketData,
  ExtraDaysType,
  OrderData,
  OrderStatusType,
  SponsorshipType,
  TicketType,
} from "./";

export function mapOrderStatusToStatusBox(s: OrderStatusType): StatusBoxStyle {
  switch (s) {
    case "CANCELED":
    case "EXPIRED":
      return "error";
    case "PENDING":
      return "warning";
    case "PAID":
      return "success";
    default:
      return "normal";
  }
}

export function calcTicketData(order: OrderData | null): BookingTicketData | null {
  if (!order) return null;
  /**Order text and daily days*/
  let ticketType: TicketType;
  let dailyDays: Date[] | undefined;
  if (order.dailyTicket) {
    ticketType = "DAILY";
    dailyDays = order.dailyDays.map((dt) => new Date(dt)).sort((a, b) => a.getTime() - b.getTime());
  } else {
    ticketType = order.sponsorship;
  }

  return {
    isDaily: order.dailyTicket,
    dailyDays: dailyDays,
    ticketType: ticketType,
  };
}

export function calculateReservationData(rawData: BookingOrderResponse): BookingOrderUiData {
  const hasOrder = !!rawData.order && ["PENDING", "PAID", "CANCELED"].includes(rawData.order.orderStatus);
  return {
    ...rawData,
    ...(calcTicketData(rawData.order) ?? {}),
    hasOrder: hasOrder,
    bookingStartDate: new Date(rawData.bookingStartTime ?? 0),
    editBookEndDate: new Date(rawData.editBookEndTime ?? 0),
    showCountdown: rawData.shouldDisplayCountdown ?? true,
    shouldUpdateInfo: rawData.shouldUpdateInfo,
    shouldRetry: !!rawData.order && ["PENDING", "CANCELED"].includes(rawData.order.orderStatus),
  };
}

export const qrCodeOptions: QRCodeOptions = {
  type: "image/webp",
  quality: 0.25,
  errorCorrectionLevel: "H",
  margin: 3,
  scale: 4,
  width: 200,
  color: {
    dark: "#000000",
    light: "#FFFFFF",
  },
} as const;

export const qrCodeLogo: Logo = {
  src: "/images/favicon.png",
  options: {
    width: 30,
  },
};

export function translateTicket(t: Translator, type: TicketType) {
  switch (type) {
    case "DAILY":
      return t("furpanel.booking.items.ticket.unformatted.daily_ticket");
    case "NONE":
      return t("furpanel.booking.items.ticket.unformatted.none_ticket");
    case "SPONSOR":
      return t("furpanel.booking.items.ticket.unformatted.sponsor_ticket");
    case "SUPER_SPONSOR":
      return t("furpanel.booking.items.ticket.unformatted.super_sponsor_ticket");
    case "ULTRA_SPONSOR":
      return t("furpanel.booking.items.ticket.unformatted.ultra_sponsor_ticket");
    default:
      console.warn("No translation for ticket type", type);
      return type;
  }
}

/** Mapping order status types */
export function translateOrderStatus(t: Translator, type: OrderStatusType): string {
  switch (type) {
    case "CANCELED":
      return t("common.order_status.CANCELED") as string;
    case "EXPIRED":
      return t("common.order_status.EXPIRED") as string;
    case "PAID":
      return t("common.order_status.PAID") as string;
    case "PENDING":
      return t("common.order_status.PENDING") as string;
    default:
      console.warn("No translation for order status type", type);
      return type;
  }
}

export function mapOrderStatusToBadgeVariant(type: OrderStatusType) {
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
}

export function translateSponsorship(t: Translator, type: SponsorshipType): string {
  switch (type) {
    case "NONE":
      return "";
    case "SPONSOR":
      return t("common.sponsorships.sponsor") as string;
    case "SUPER_SPONSOR":
      return t("common.sponsorships.super_sponsor") as string;
    case "ULTRA_SPONSOR":
      return t("common.sponsorships.ultra_sponsor") as string;
    default:
      console.warn("No translation for sponsorship type", type);
      return type;
  }
}

export function sponsorshipClassName(type: SponsorshipType) {
  switch (type) {
    case "NONE":
      return "";
    case "SPONSOR":
      return "sponsor-highlight";
    case "SUPER_SPONSOR":
      return "super-sponsor-highlight";
    case "ULTRA_SPONSOR":
    default:
      console.warn("No class name for sponsorship type", type);
      return type;
  }
}

export function translateExtraDays(t: Translator, type: ExtraDaysType): string {
  switch (type) {
    case "NONE":
      return "";
    case "EARLY":
      return t("furpanel.booking.items.extra_days_EARLY") as string;
    case "LATE":
      return t("furpanel.booking.items.extra_days_LATE") as string;
    case "BOTH":
      return t("furpanel.booking.items.extra_days_BOTH") as string;
    default:
      console.warn("No translation for extra days type", type);
      return type;
  }
}

export function translateBoard(t: Translator, type: Board): string {
  switch (type) {
    case Board.NONE:
      return "";
    case Board.HALF:
      return t("furpanel.booking.items.board_HALF") as string;
    case Board.FULL:
      return t("furpanel.booking.items.board_FULL") as string;
    default:
      console.warn("No translation for board type", type);
      return type;
  }
}
