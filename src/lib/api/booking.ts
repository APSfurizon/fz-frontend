import { StatusBoxStyle } from "@/components/statusBox";
import { ConventionEvent } from "./counts";
import { ApiErrorResponse, ApiResponse, ApiAction, RequestType } from "./global";
import { RoomData } from "./room";
import { QRCodeOptions } from "next-qrcode/dist/useQRCode";

export type OrderStatusType = "CANCELED" | "PENDING" | "PAID" | "EXPIRED";
export type SponsorshipType = "NONE" | "SPONSOR" | "SUPER_SPONSOR" | "ULTRA_SPONSOR";
export type ExtraDaysType = "NONE" | "EARLY" | "LATE" | "BOTH";

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

export enum Board {
    NONE="NONE",
    HALF="HALF",
    FULL="FULL"
}

export interface OrderData {
    code: string,
    checkinSecret: string,
    orderStatus: OrderStatusType,
    sponsorship: SponsorshipType,
    sponsorNames: Record<string, string>,
    extraDays: ExtraDaysType,
    board: Board,
    dailyDays: string[],
    totalFursuits: number,
    room: RoomData,
    checkinDate: string,
    checkoutDate: string,
    noRoomTicketFromDate: string,
    noRoomTicketToDate: string,
    dailyTicket: boolean,
    orderEvent: ConventionEvent,
}

export interface BookingOrderResponse extends ApiResponse {
    shouldDisplayCountdown: boolean,
    bookingStartTime: string,
    editBookEndTime: string,
    eventNames: Record<string, string>,
    geoLatitude: number,
    geoLongitude: number,
    hasActiveMembershipForEvent: boolean,
    shouldUpdateInfo: boolean,
    canExchange: boolean,
    exchangeSupported: boolean,
    order: OrderData,
    errors: ("SERVER_ERROR" | "MEMBERSHIP_MULTIPLE_DONE" | "MEMBERSHIP_MISSING" |
        "ORDER_MULTIPLE_DONE" | "ORDER_SECRET_NOT_MATCH" | "ORDER_ALREADY_OWNED_BY_SOMEBODY_ELSE")[]
}

export interface BookingTicketData {
    ticketName: string,
    dailyDays?: Date[],
    isDaily: boolean | undefined,
}

export interface BookingOrderUiData extends BookingTicketData {
    hasOrder: boolean,
    bookingStartDate: Date,
    editBookEndDate: Date,
    showCountdown: boolean,
    shouldUpdateInfo: boolean,
    shouldRetry: boolean
};

export function calcTicketData(order: OrderData): BookingTicketData {
    /**Order text and daily days*/
    let ticketName: string = "";
    let dailyDays: Date[] | undefined;
    if (order.dailyTicket) {
        ticketName = "daily_ticket";
        dailyDays = order.dailyDays.map(dt => new Date(dt)).sort((a, b) => a.getTime() - b.getTime());
    } else {
        ticketName = order.sponsorship.toLowerCase() + "_ticket";
    }

    return {
        isDaily: order.dailyTicket,
        dailyDays: dailyDays,
        ticketName: ticketName
    }
}

export const qrCodeOptions: QRCodeOptions = {
    type: 'image/webp',
    quality: 0.25,
    errorCorrectionLevel: 'H',
    margin: 3,
    scale: 4,
    width: 200,
    color: {
        dark: '#000000',
        light: '#FFFFFF',
    }
} as const;

export class BookingOrderApiAction extends ApiAction<BookingOrderResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "orders-workflow/get-full-status";
}

export interface ShopLinkResponse extends ApiResponse {
    link: string
}

export class ShopLinkApiAction extends ApiAction<ShopLinkResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "orders-workflow/generate-pretix-shop-link";
}

export class OrderEditLinkApiAction extends ApiAction<ShopLinkResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "orders-workflow/get-order-edit-link";
}

export class OrderRetryLinkApiAction extends ApiAction<ShopLinkResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "orders-workflow/get-order-retry-payment-link";
}

export class ConfirmMembershipDataApiAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "membership/mark-personal-user-information-as-updated";
}