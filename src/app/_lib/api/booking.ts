import { ApiErrorResponse, ApiResponse, RequestAction } from "./global";
import { RoomDataResponse } from "./room";

export interface OrderData {
    code: string,
    orderStatus: "CANCELED" | "PENDING" | "PAID" | "EXPIRED",
    sponsorship: "NONE" | "SPONSOR" | "SUPER_SPONSOR",
    extraDays: "NONE" | "EARLY" | "LATE" | "BOTH",
    isDailyTicket: boolean,
    dailyDays: number[],
    room: RoomDataResponse
}

export interface BookingOrderResponse extends ApiResponse {
    shouldDisplayCountdown: boolean,
    bookingStartTime: string,
    editBookEndTime: string,
    eventNames: Record<string, string>,
    hasActiveMembershipForEvent: boolean,
    order: OrderData,
    errors: ("SERVER_ERROR" | "MEMBERSHIP_MULTIPLE_DONE" | "MEMBERSHIP_MISSING" |
         "ORDER_MULTIPLE_DONE" | "ORDER_SECRET_NOT_MATCH" | "ORDER_ALREADY_OWNED_BY_SOMEBODY_ELSE")[]
}

export class BookingOrderApiAction implements RequestAction<BookingOrderResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "orders-workflow/get-full-status";
    onSuccess: (status: number, body?: BookingOrderResponse) => void = (status: number, body?: BookingOrderResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export interface ShopLinkResponse extends ApiResponse {
    link: string
}

export class ShopLinkApiAction implements RequestAction<ShopLinkResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "orders-workflow/generate-pretix-shop-link";
    onSuccess: (status: number, body?: ShopLinkResponse) => void = (status: number, body?: ShopLinkResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export class OrderEditLinkApiAction implements RequestAction<ShopLinkResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "orders-workflow/get-order-edit-link";
    onSuccess: (status: number, body?: ShopLinkResponse) => void = (status: number, body?: ShopLinkResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}