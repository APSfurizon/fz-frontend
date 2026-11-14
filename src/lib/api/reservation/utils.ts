import { StatusBoxStyle } from "@/components/statusBox";
import { Logo, QRCodeOptions } from "next-qrcode/dist/useQRCode";
import {
  BookingOrderResponse,
  BookingOrderUiData,
  BookingTicketData,
  OrderData,
  OrderStatusType,
  TicketType,
} from "./types";

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

export function calcTicketData(order: OrderData): BookingTicketData {
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

export function calculateReservationData(rawData?: BookingOrderResponse): BookingOrderUiData | null {
  const hasOrder = rawData && rawData.order && ["PENDING", "PAID", "CANCELED"].includes(rawData.order.orderStatus);
  if (!hasOrder) return null;
  return {
    ...calcTicketData(rawData.order),
    hasOrder: hasOrder,
    bookingStartDate: new Date(rawData.bookingStartTime ?? 0),
    editBookEndDate: new Date(rawData.editBookEndTime ?? 0),
    showCountdown: rawData.shouldDisplayCountdown ?? true,
    shouldUpdateInfo: rawData.shouldUpdateInfo,
    shouldRetry: ["PENDING", "CANCELED"].includes(rawData.order.orderStatus),
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
