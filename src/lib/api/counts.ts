import { FursuitDetails } from "./badge/fursuits";
import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "./global";
import { RoomData } from "./room";
import { ExtraDays, SponsorType, UserData } from "./user";

export interface FursuitCountResponse extends ApiResponse {
    fursuits: FursuitDetails[]
}

export class FursuitCountApiAction extends ApiAction<FursuitCountResponse, ApiErrorResponse> {
    authenticated = false;
    method = RequestType.GET;
    urlAction = "counts/fursuit";
}

export interface SponsorCountResponse extends ApiResponse {
    users: Record<SponsorType, UserData[]>;
}

export class SponsorCountApiAction extends ApiAction<SponsorCountResponse, ApiErrorResponse> {
    authenticated = false;
    method = RequestType.GET;
    urlAction = "counts/sponsors";
}

export interface RoomGuestData {
    user: UserData,
    extraDays?: ExtraDays
}

export interface NoseRoomDetails {
    id: number,
    roomName: string,
    roomExtraDays: ExtraDays,
    guests: RoomGuestData[]
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

export class NoseCountApiAction extends ApiAction<NoseCountResponse, ApiErrorResponse> {
    authenticated = false;
    method = RequestType.GET;
    urlAction = "counts/bopos";
}

export interface ConventionEvent {
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
    events: ConventionEvent[]
}

export class GetAllEventsApiAction extends ApiAction<AllEventsResponse, ApiErrorResponse> {
    authenticated = false;
    method = RequestType.GET;
    urlAction = "events/";
}

export interface CurrentEventResponse extends ConventionEvent, ApiResponse { }

export class GetCurrentEventApiAction extends ApiAction<CurrentEventResponse, ApiErrorResponse> {
    authenticated = false;
    method = RequestType.GET;
    urlAction = "events/current";
}