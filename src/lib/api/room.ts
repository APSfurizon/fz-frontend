import { FormApiAction, FormDTOBuilder } from "../components/dataForm";
import { ExtraDaysType } from "./booking";
import { ApiErrorResponse, ApiResponse, ApiAction, RequestType } from "./global";
import { OrderExchangeInitApiData, OrderStatus } from "./order";
import { SponsorType, UserData } from "./user";

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
    unconfirmationSupported: boolean,
    canUnconfirm: boolean,
    confirmed: boolean,

    showInNosecount: boolean,
    eventId: number
    roomData: RoomData,
    canInvite: boolean,
    extraDays: ExtraDaysType,
    guests: RoomGuestHeader[]
}

export interface RoomCreateData {
    name: string
}

export interface RoomCreateResponse extends RoomInfo, ApiResponse { }

export class RoomCreateApiAction extends ApiAction<RoomCreateResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "room/create";
}

export interface RoomInvitation {
    room: RoomInfo,
    invitation: RoomGuest,
}

export interface RoomInfoResponse extends ApiResponse {
    currentRoomInfo: RoomInfo,
    hasOrder: boolean,
    allowedModifications: boolean
    canCreateRoom: boolean,
    buyOrUpgradeRoomSupported: boolean,
    canBuyOrUpgradeRoom: boolean,
    exchangeSupported: boolean,
    canExchange: boolean,
    editingRoomEndTime: string,
    invitations: RoomInvitation[]
}

export class RoomInfoApiAction extends ApiAction<RoomInfoResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "room/info";
}

export interface RoomEditData {
    roomId: number
}

export interface RoomRenameData extends RoomCreateData, RoomEditData { }

export class RoomRenameDTOBuilder implements FormDTOBuilder<RoomRenameData> {
    mapToDTO = (data: FormData) => {
        const toReturn: RoomRenameData = {
            roomId: parseInt(data.get('roomId')!.toString()),
            name: data.get('name')?.toString() ?? ""
        };
        return toReturn;
    }
}

export class RoomRenameFormAction extends FormApiAction<RoomRenameData, ApiResponse, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new RoomRenameDTOBuilder();
    urlAction = "room/change-name";
}

export class RoomDeleteAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
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
        const toReturn: RoomInviteApiData = {
            roomId: parseInt(data.get('roomId')!.toString()),
            userIds: data.get('invitedUsers')!.toString().split(',').map(val => parseInt(val)),
            force: (data.get('force')! ?? "").toString().toLowerCase() === "true",
            forceExit: (data.get('forceExit')! ?? "").toString().toLowerCase() === "true"
        };
        return toReturn;
    }
}

export class RoomInviteFormAction extends FormApiAction<RoomInviteApiData, RoomInviteResponse, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new RoomInviteDTOBuilder();
    urlAction = "room/invite";
}

/**
 * Room invitation management
 */

export interface GuestIdApiData {
    guestId: number
}

export class RoomInviteAnswerAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "room/invite";
}

export class RoomKickAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "room/kick";
}

export class RoomKickFormDTOBuilder implements FormDTOBuilder<GuestIdApiData> {
    mapToDTO = (data: FormData): GuestIdApiData => ({
        guestId: parseInt(data.get("guestId")?.toString() ?? "")
    })
}

export class RoomKickFormAction extends FormApiAction<GuestIdApiData, boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    dtoBuilder = new RoomKickFormDTOBuilder ();
    urlAction = "room/kick";
}

export class RoomLeaveAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "room/leave";
}

export class RoomExchangeInitDTOBuilder implements FormDTOBuilder<OrderExchangeInitApiData> {
    mapToDTO = (data: FormData) => {
        const toReturn: OrderExchangeInitApiData = {
            sourceUserId: parseInt(data.get('userId')!.toString()),
            destUserId: parseInt(data.get('recipientId')!.toString()),
            action: "room"
        };
        return toReturn;
    }
}

export class RoomExchangeFormAction extends FormApiAction<OrderExchangeInitApiData, boolean, ApiErrorResponse> {
    method = RequestType.POST;
    authenticated = true;
    dtoBuilder = new RoomExchangeInitDTOBuilder();
    urlAction = "room/exchange/init";
}

export interface RoomSetShowInNosecountData {
    roomId?: number,
    showInNosecount: boolean
}

export class RoomSetShowInNosecountApiAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "room/show-in-nosecount";
}

export interface RoomIdRequest {
    roomId: number
}

export class RoomConfirmAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "room/confirm";
}

export class RoomUnconfirmAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "room/unconfirm";
}

export const EMPTY_ROOM_INFO: RoomInfoResponse = {
    hasOrder: false,
    canCreateRoom: false,
    allowedModifications: false,
    buyOrUpgradeRoomSupported: false,
    canBuyOrUpgradeRoom: false,
    exchangeSupported: false,
    canExchange: false,
    editingRoomEndTime: new Date().toString(),
    invitations: [],
    currentRoomInfo: {
        roomId: 0,
        roomName: "",
        roomOwner: {
            userId: 1,
            sponsorship: SponsorType.NONE
        },
        guests: [],
        userIsOwner: false,
        confirmationSupported: false,
        unconfirmationSupported: false,
        canConfirm: false,
        canUnconfirm: false,
        confirmed: false,
        roomData: {
            roomCapacity: 0,
            roomInternalName: "",
            roomPretixItemId: 0,
            roomTypeNames: {}
        },
        canInvite: false,
        showInNosecount: false,
        eventId: 0,
        extraDays: "NONE"
    }
};