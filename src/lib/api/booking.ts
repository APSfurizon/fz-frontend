import { StatusBoxStyle } from "@/components/statusBox";
import { ConventionEvent } from "./counts";
import { ApiErrorResponse, ApiResponse, ApiAction } from "./global";
import { RoomData } from "./room";

export type OrderStatusType = "CANCELED" | "PENDING" | "PAID" | "EXPIRED";
export type SponsorshipType = "NONE" | "SPONSOR" | "SUPER_SPONSOR";
export type ExtraDaysType = "NONE" | "EARLY" | "LATE" | "BOTH";

export function mapOrderStatusToStatusBox (s: OrderStatusType): StatusBoxStyle {
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

export interface OrderData {
    code: string,
    orderStatus: OrderStatusType,
    sponsorship: SponsorshipType,
    extraDays: ExtraDaysType,
    dailyTicket: boolean,
    dailyDays: string[],
    room: RoomData,
    totalFursuits: number,
    orderEvent: ConventionEvent
}

export interface BookingOrderResponse extends ApiResponse {
    shouldDisplayCountdown: boolean,
    bookingStartTime: string,
    editBookEndTime: string,
    eventNames: Record<string, string>,
    hasActiveMembershipForEvent: boolean,
    shouldUpdateInfo: boolean,
    canExchange: boolean,
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
    shouldUpdateInfo: boolean,
    shouldRetry: boolean
};

export function calcTicketData (order: OrderData): BookingTicketData {
    /**Order text and daily days*/
    let ticketName: string = "";
    let dailyDays: Date[] | undefined;
    if (order.dailyTicket) {
        ticketName = "daily_ticket";
        dailyDays = order.dailyDays.map(dt=>new Date(dt)).sort((a,b)=>a.getTime()-b.getTime());
    } else {
        ticketName = order.sponsorship.toLowerCase() + "_ticket";
    }

    return {
        isDaily: order.dailyTicket,
        dailyDays: dailyDays,
        ticketName: ticketName
    }
}

export class BookingOrderApiAction implements ApiAction<BookingOrderResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "orders-workflow/get-full-status";
}

export interface ShopLinkResponse extends ApiResponse {
    link: string
}

export class ShopLinkApiAction implements ApiAction<ShopLinkResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "orders-workflow/generate-pretix-shop-link";
}

export class OrderEditLinkApiAction implements ApiAction<ShopLinkResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "orders-workflow/get-order-edit-link";
}

export class OrderRetryLinkApiAction implements ApiAction<ShopLinkResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "orders-workflow/get-order-retry-payment-link";
}

export class ConfirmMembershipDataApiAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "membership/mark-persona-user-information-as-updated";
}