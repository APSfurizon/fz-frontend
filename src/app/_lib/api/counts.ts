import { Fursuit, FursuitDetails } from "./badge/fursuits";
import { ApiAction, ApiErrorResponse, ApiResponse } from "./global";
import { RoomData } from "./room";
import { SponsorType, UserData } from "./user";

export interface FursuitCountResponse extends ApiResponse {
    fursuits: FursuitDetails[]
}

export class FursuitCountApiAction implements ApiAction<FursuitCountResponse, ApiErrorResponse> {
    authenticated = false;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "counts/fursuit";
    onSuccess: (status: number, body?: FursuitCountResponse) => void = (status: number, body?: FursuitCountResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export interface SponsorCountResponse extends ApiResponse {
    users: Record<SponsorType, UserData[]>;
}

export class SponsorCountApiAction implements ApiAction<SponsorCountResponse, ApiErrorResponse> {
    authenticated = false;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "counts/sponsors";
    onSuccess: (status: number, body?: SponsorCountResponse) => void = (status: number, body?: SponsorCountResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export interface NoseRoomDetails {
    id: number,
    roomName: string,
    guests: UserData[]
}

export interface NoseRoomHeader {
    roomData: RoomData,
    rooms: NoseRoomDetails[]
}

export interface HotelData {
    displayName: Record<string, string>,
    internalName: string,
    roomTypes: NoseRoomHeader[]
}

export interface NoseCountResponse extends ApiResponse {
    hotels: HotelData[],
    ticketOnlyFurs: UserData[],
    dailyFurs: Record<string, UserData[]>
}

export class NoseCountApiAction implements ApiAction<NoseCountResponse, ApiErrorResponse> {
    authenticated = false;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "counts/bopos";
    onSuccess: (status: number, body?: NoseCountResponse) => void = (status: number, body?: NoseCountResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export interface Event {
    slug: string,
    publicUrl: string,
    id: number,
    dateTo: string,
    dateFrom: string,
    eventNames: Record<string, string>,
    current: boolean,
    organizerAndEventPair: {
        organizer: string,
        event: string
    }
}

export interface AllEventsResponse extends ApiResponse {
    events: Event[]
}

export class GetAllEventsApiAction implements ApiAction<AllEventsResponse, ApiErrorResponse> {
    authenticated = false;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "events/";
    onSuccess: (status: number, body?: AllEventsResponse) => void = (status: number, body?: AllEventsResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export interface CurrentEventResponse extends Event, ApiResponse {
    events: Event[]
}

export class GetCurrentEventApiAction implements ApiAction<CurrentEventResponse, ApiErrorResponse> {
    authenticated = false;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "events/current";
    onSuccess: (status: number, body?: CurrentEventResponse) => void = (status: number, body?: CurrentEventResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}