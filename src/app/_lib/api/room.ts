import { ApiResponse } from "./global";
import { UserData } from "./user";

export interface RoomData {
    roomCapacity: number,
    roomTypeNames: Record<string, string>
}

export interface RoomDataResponse extends ApiResponse, RoomData {}

export interface UserRoom extends RoomData {
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