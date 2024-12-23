import { ApiErrorResponse, ApiResponse, RequestAction } from "./global";
import { RoomData } from "./room";

export interface OrderData {
    code: string,
    orderStatus: "CANCELED" | "PENDING" | "PAID" | "EXPIRED",
    sponsorship: "NONE" | "SPONSOR" | "SUPER_SPONSOR",
    extraDays: "NONE" | "EARLY" | "LATE" | "BOTH",
    dailyTicket: boolean,
    dailyDays: string[],
    room: RoomData
}

export interface BookingOrderResponse extends ApiResponse {
    shouldDisplayCountdown: boolean,
    bookingStartTime: string,
    editBookEndTime: string,
    eventNames: Record<string, string>,
    hasActiveMembershipForEvent: boolean,
    shouldUpdateInfo: boolean,
    order: OrderData,
    errors: ("SERVER_ERROR" | "MEMBERSHIP_MULTIPLE_DONE" | "MEMBERSHIP_MISSING" |
         "ORDER_MULTIPLE_DONE" | "ORDER_SECRET_NOT_MATCH" | "ORDER_ALREADY_OWNED_BY_SOMEBODY_ELSE")[]
}

export interface BookingOrderUiData {
    hasOrder: boolean,
    ticketName: string,
    isDaily: boolean | undefined,
    dailyDays: Date[] | undefined,
    bookingStartDate: Date,
    editBookEndDate: Date,
    shouldUpdateInfo: boolean,
    shouldRetry: boolean
};

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

export class OrderRetryLinkApiAction implements RequestAction<ShopLinkResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "orders-workflow/get-order-retry-payment-link";
    onSuccess: (status: number, body?: ShopLinkResponse) => void = (status: number, body?: ShopLinkResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export class ConfirmMembershipDataApiAction implements RequestAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "membership/mark-persona-user-information-as-updated";
    onSuccess: (status: number, body?: Boolean) => void = (status: number, body?: Boolean) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}