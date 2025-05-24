import { BadgeStatusApiResponse } from "../badge/badge";
import { SponsorshipType } from "../booking";
import { ConventionEvent } from "../counts";
import { ExchangeStatusApiResponse } from "../exchange";
import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "../global";
import { OrderStatus } from "../order";
import { Permissions } from "../permission";
import { RoomInfoResponse } from "../room";
import { ExtraDays, UserPersonalInfo } from "../user";
import { MembershipCard } from "./membershipManager";
import { RoleData } from "./role";

export interface FullOrder {
    code: string,
    orderStatus: OrderStatus,
    sponsorship: SponsorshipType,
    extraDays: ExtraDays,
    dailyDays: string[],
    pretixRoomItemId: number,
    roomCapacity: number,
    hotelInternalName: string,
    roomInternalName: string,
    pretixOrderSecret: string,
    checkinSecret: string,
    hasMembership: boolean,
    ticketPositionId: number,
    ticketPositionPosid: number,
    roomPositionId: number,
    roomPositionPosid: number,
    earlyPositionId: number,
    latePositionId: number,
    extraFursuits: number,
    buyerEmail: string,
    buyerPhone: string,
    buyerUser: string
    buyerLocale: string,
    requiresAttention: boolean,
    internalComment: string,
    checkinText: string,
    orderSerialInEvent: number,
    orderOwnerUserId: number,
    orderOwner: any,
    userFinder: any,
    eventId: number,
    orderEvent: ConventionEvent,
    eventFinder: any,
    id: number,
    dailyDaysBitmask: number,
    daily: boolean,
    membership: boolean
}

export interface GetUserAdminViewResponse extends ApiResponse {
    personalInfo: UserPersonalInfo,
    membershipCards: MembershipCard[],
    email: string,
    banned: boolean,
    orders: FullOrder[]
    currentRoomdata: RoomInfoResponse,
    exchanges: ExchangeStatusApiResponse,
    otherRooms: RoomInfoResponse[],
    showInNousecount: boolean,
    badgeData: BadgeStatusApiResponse,
    roles: RoleData[],
    permissions: Permissions[]
}

/**
 * Uses path param: users/view/id
 */
export class GetUserAdminViewAction extends ApiAction<GetUserAdminViewResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "users/view";
}

export interface UserIdRequestData {
    userId: number,
}

export class BanUserAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "authentication/ban";
}


export class UnbanUserAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "authentication/unban";
}

export interface ViewOrderLinkResponse extends ApiResponse {
    link: string
}

export class ViewOrderLinkApiAction extends ApiAction<ViewOrderLinkResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "orders-workflow/generate-pretix-control-order-link";
}

export interface ShowInNosecountApiInput {
    userId: number,
    showInNosecount: boolean
}

export class ShowInNosecountApiAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "users/show-in-nosecount";
}