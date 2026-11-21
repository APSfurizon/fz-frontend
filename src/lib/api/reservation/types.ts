import { ConventionEvent } from "../counts";
import { ApiResponse } from "../networking";
import { RoomData } from "../room";

export type OrderStatusType = "CANCELED" | "PENDING" | "PAID" | "EXPIRED";
export type SponsorshipType = "NONE" | "SPONSOR" | "SUPER_SPONSOR" | "ULTRA_SPONSOR";
export type TicketType = SponsorshipType | "DAILY";
export type ExtraDaysType = "NONE" | "EARLY" | "LATE" | "BOTH";

export enum Board {
  NONE = "NONE",
  HALF = "HALF",
  FULL = "FULL",
}

export interface OrderData {
  code: string;
  checkinSecret: string;
  orderStatus: OrderStatusType;
  sponsorship: SponsorshipType;
  sponsorNames: Record<string, string>;
  extraDays: ExtraDaysType;
  board: Board;
  dailyDays: string[];
  totalFursuits: number;
  room: RoomData;
  checkinDate: string;
  checkoutDate: string;
  noRoomTicketFromDate: string;
  noRoomTicketToDate: string;
  dailyTicket: boolean;
  orderEvent: ConventionEvent;
}

export type ReservationError =
  | "SERVER_ERROR"
  | "MEMBERSHIP_MULTIPLE_DONE"
  | "MEMBERSHIP_MISSING"
  | "ORDER_NOT_FOUND"
  | "ORDER_MULTIPLE_DONE"
  | "ORDER_SECRET_NOT_MATCH"
  | "ORDER_ALREADY_OWNED_BY_SOMEBODY_ELSE"
  | "SHOP_NOT_OPENED_YET"
  | "ORDER_EDITS_CLOSED"
  | "PERSONAL_USER_INFO_NOT_UPDATED"
  | "BELOW_MINIMUM_AGE"
  | "PAYMENT_INVALID_STATE"
  | "REFUND_INVALID_STATE"
  | "POSITION_CANCELED";

export interface BookingOrderResponse extends ApiResponse {
  shouldDisplayCountdown: boolean;
  bookingStartTime: string;
  editBookEndTime: string;
  eventNames: Record<string, string>;
  geoLatitude: number;
  geoLongitude: number;
  hasActiveMembershipForEvent: boolean;
  shouldUpdateInfo: boolean;
  canExchange: boolean;
  exchangeSupported: boolean;
  order: OrderData | null;
  errors: ReservationError[];
}

export interface ShopLinkResponse extends ApiResponse {
  link: string;
}

export interface BookingTicketData {
  ticketType: TicketType;
  dailyDays?: Date[];
  isDaily: boolean | undefined;
}

export interface BookingOrderUiData extends Partial<BookingTicketData>, BookingOrderResponse {
  hasOrder: boolean;
  bookingStartDate: Date;
  editBookEndDate: Date;
  showCountdown: boolean;
  shouldUpdateInfo: boolean;
  shouldRetry: boolean;
}

export interface OrderExchangeInitApiData {
  sourceUserId: number;
  destUserId: number;
  action: "room" | "order";
}
