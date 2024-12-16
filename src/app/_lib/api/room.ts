import { FormApiAction, FormDTOBuilder } from "../components/dataForm";
import { ApiErrorResponse, ApiResponse } from "./global";
import { UserData } from "./user";

export interface RoomData {
    roomCapacity: number,
    roomTypeNames: Record<string, string>
}

export interface RoomDataResponse extends ApiResponse, RoomData {}

export interface UserRoom extends RoomData {
    id: number,
    owner: UserData,
    guests: UserData[],
    pendingInvites: RoomInviteData[],
    roomName: string,
    confirmed: boolean
}

export interface RoomInviteData {
    id: number,
    sender: UserData,
    recipient: UserData,
    room: UserRoom
}

export interface RoomInviteFetchResponse extends ApiResponse {
    roomInvites: RoomInviteData[]
}

export interface RoomRenameData {
    roomId: number,
    newName: string | undefined
}

export interface RoomRenameResponse extends ApiResponse {
    success: boolean
}

export class RoomRenameDTOBuilder implements FormDTOBuilder<RoomRenameData> {
    mapToDTO = (data: FormData) => {
        let toReturn: RoomRenameData = {
            roomId: parseInt (data.get('roomId')!.toString ()),
            newName: data.get('newName')?.toString ()
        };
        return toReturn;
    }
}

export class RoomRenameFormAction implements FormApiAction<RoomRenameData, RoomRenameResponse, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new RoomRenameDTOBuilder ();
    urlAction = "room/rename";
    onSuccess: (status: number, body?: RoomRenameResponse) => void = (status: number, body?: RoomRenameResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export interface RoomInviteApiData {
    roomId: number,
    invitedUsers: number[]
}

export interface RoomInviteResponse extends ApiResponse {
    success: boolean
}

export class RoomInviteDTOBuilder implements FormDTOBuilder<RoomInviteApiData> {
    mapToDTO = (data: FormData) => {
        let toReturn: RoomInviteApiData = {
            roomId: parseInt (data.get('roomId')!.toString ()),
            invitedUsers: data.get('invitedUsers')!.toString ().split(',').map(val=>parseInt(val))
        };
        return toReturn;
    }
}

export class RoomInviteFormAction implements FormApiAction<RoomInviteApiData, RoomInviteResponse, ApiErrorResponse> {
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST"
    authenticated = true;
    dtoBuilder = new RoomInviteDTOBuilder ();
    urlAction = "room/invite";
    onSuccess: (status: number, body?: RoomInviteResponse) => void = (status: number, body?: RoomInviteResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}