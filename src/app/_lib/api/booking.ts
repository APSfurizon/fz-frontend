import { ApiResponse } from "./global";
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
    bookingStartTime: Date,
    editBookEndTime: Date,
    eventNames: Record<string, string>,
    hasActiveMembershipForEvent: boolean,
    order: OrderData,
    errors: ("SERVER_ERROR" | "MEMBERSHIP_MULTIPLE_DONE" | "MEMBERSHIP_MISSING" |
         "ORDER_MULTIPLE_DONE" | "ORDER_SECRET_NOT_MATCH" | "ORDER_ALREADY_OWNED_BY_SOMEBODY_ELSE")[]
}