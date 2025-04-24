import { ShopLinkResponse } from "../booking";
import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "../global";
import { RoomData } from "../room";

export interface PretixItemQuota {
    available: boolean,
    available_number: number,
    total_size: number,
    pending_orders: number,
    paid_orders: number,
    exited_orders: number,
    cart_positions: number,
    blocking_vouchers: number,
    waiting_list: number,
    unlimited: boolean,
    used: number
}

export function getTotalPretixQuota(quota: PretixItemQuota) {
    return quota.total_size !== undefined && quota.total_size !== null ? quota.total_size : Number.MAX_SAFE_INTEGER;
}

export function getUsedPretixQuota(quota: PretixItemQuota) {
    return quota.pending_orders + quota.paid_orders + quota.exited_orders + quota.cart_positions + quota.blocking_vouchers + quota.waiting_list;
}

export function getRemainingPretixQuota(quota: PretixItemQuota) {
    return Math.max(getTotalPretixQuota(quota) - getUsedPretixQuota(quota), 0);
}

export function getRemainingRoomType(room: RoomTypeInfo) {
    return room.remaining ?? Number.MAX_SAFE_INTEGER;
}

export interface RoomTypeInfo {
    data: RoomData,
    price: string,
    remaining?: number   
}

export interface RoomStoreItemsApiResponse extends ApiResponse {
    currentRoom: RoomData,
    priceOfCurrentRoom: string,
    rooms: RoomTypeInfo[]
}

/**
 * Endpoint to list available room types
 */
export class RoomStoreItemsApiAction extends ApiAction<RoomStoreItemsApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "room/get-room-list-with-quota";
}

export interface RoomBuyApiData {
    userId: number,
    roomPretixItemId: number
}

/**
 * Endpoint to try buy or upgrade your room
 */
export class RoomStoreBuyAction extends ApiAction<ShopLinkResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "room/buy-or-upgrade-room";
}