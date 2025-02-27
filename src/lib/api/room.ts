import { FormApiAction, FormDTOBuilder } from "../components/dataForm";
import { nullifyEmptyString, nullifyEmptyStrings } from "../utils";
import { ApiErrorResponse, ApiResponse, ApiAction } from "./global";
import { OrderExchangeInitApiData, OrderStatus } from "./order";
import { UserData } from "./user";

export interface RoomGuestHeader {
    roomGuest: RoomGuest,
    user: UserData,
    orderStatus: OrderStatus
}

export interface RoomGuest {
    guestId: number,
    userId: number,
    roomId: number,
    confirmed: boolean
}

export interface RoomData {
    roomCapacity: number,
    roomPretixItemId: number,
    roomInternalName: string,
    roomTypeNames: Record<string, string>,
}

export interface RoomInfo {
    roomId: number,
    roomName: string,
    roomOwner: UserData,
    userIsOwner: boolean,

    confirmationSupported: boolean,
    canConfirm: boolean,
    canUnconfirm: boolean,
    confirmed: boolean,

    roomData: RoomData,
    canInvite: boolean,
    guests: RoomGuestHeader[],
    owner: boolean,

    showInNosecount: boolean
}

export interface RoomCreateData {
    name: string
}

export interface RoomCreateResponse extends RoomInfo, ApiResponse {}

export class RoomCreateApiAction implements ApiAction<RoomCreateResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "room/create";
}

export interface RoomInvitation {
    room: RoomInfo,
    invitation: RoomGuest,
}

export interface RoomInfoResponse extends ApiResponse {
    hasOrder: boolean,
    canCreateRoom: boolean,
    editingRoomEndTime: string,
    currentRoomInfo: RoomInfo,
    invitations: RoomInvitation[],
    buyOrUpgradeRoomSupported: boolean,
    canBuyOrUpgradeRoom: boolean,
    canExchange: boolean
}

export class RoomInfoApiAction implements ApiAction<RoomInfoResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "room/info";
}

export interface RoomEditData {
    roomId: number
}

export interface RoomRenameData extends RoomCreateData, RoomEditData {}

export class RoomRenameDTOBuilder implements FormDTOBuilder<RoomRenameData> {
    mapToDTO = (data: FormData) => {
        let toReturn: RoomRenameData = {
            roomId: parseInt (data.get('roomId')!.toString ()),
            name: data.get('name')?.toString () ?? ""
        };
        return toReturn;
    }
}

export class RoomRenameFormAction implements FormApiAction<RoomRenameData, ApiResponse, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new RoomRenameDTOBuilder ();
    urlAction = "room/change-name";
}

export class RoomDeleteAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "room/delete";
}

/**
 * Room Invitation
 */

export interface RoomInviteApiData {
    roomId: number,
    userIds: number[],
    force: boolean,
    forceExit: boolean
}

export interface RoomInviteResponse extends ApiResponse {
    guests: RoomGuest[]
}

export class RoomInviteDTOBuilder implements FormDTOBuilder<RoomInviteApiData> {
    mapToDTO = (data: FormData) => {
        let toReturn: RoomInviteApiData = {
            roomId: parseInt (data.get('roomId')!.toString ()),
            userIds: data.get('invitedUsers')!.toString ().split(',').map(val=>parseInt(val)),
            force: (data.get('force')! ?? "").toString().toLowerCase() === "true",
            forceExit: (data.get('forceExit')! ?? "").toString().toLowerCase() === "true"
        };
        return toReturn;
    }
}

export class RoomInviteFormAction implements FormApiAction<RoomInviteApiData, RoomInviteResponse, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new RoomInviteDTOBuilder ();
    urlAction = "room/invite";
}

/**
 * Room invitation management
 */

export interface GuestIdApiData {
    guestId: number
}

export class RoomInviteAnswerAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "room/invite";
}

export class RoomKickAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "room/kick";
}

export class RoomLeaveAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "room/leave";
}

export class RoomExchangeInitDTOBuilder implements FormDTOBuilder<OrderExchangeInitApiData> {
    mapToDTO = (data: FormData) => {
        let toReturn: OrderExchangeInitApiData = {
            sourceUserId: parseInt(data.get('userId')!.toString ()),
            destUserId: parseInt(data.get('recipientId')!.toString()),
            action: "room"
        };
        return toReturn;
    }
}

export class RoomExchangeFormAction implements FormApiAction<OrderExchangeInitApiData, Boolean, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new RoomExchangeInitDTOBuilder ();
    urlAction = "room/exchange/init";
}

export interface RoomSetShowInNosecountData {
    roomId?: number,
    showInNosecount: boolean
}

export class RoomSetShowInNosecountApiAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "room/show-in-nosecount";
}