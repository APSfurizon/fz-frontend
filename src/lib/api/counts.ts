import { createContext, useContext } from "react";
import { TranslatableString } from "../translations";
import { FursuitDetails } from "./badge/fursuits";
import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "./global";
import { RoomData } from "./room";
import { ExtraDays, SponsorType, UserData } from "./user";

export enum CountViewMode {
    NORMAL = "all",
    FURSUIT = "fursuits",
    SPONSOR = "sponsors"
}

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

export interface RoomlessFur {
    user: UserData,
    extraDays: ExtraDays
}

export interface NoseCountResponse extends ApiResponse {
    hotels: HotelData[],
    roomlessFurs: RoomlessFur[],
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
    eventNames: TranslatableString,
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

// Context management
export interface NosecountUpdate {
    event?: ConventionEvent,
    mode: CountViewMode,
    selectEvent: (slug: string) => void,
    selectMode: (mode: string) => void
}

export const NosecountContext = createContext<NosecountUpdate | undefined>(undefined);

export const useNosecountContext: () => NosecountUpdate = () => {
    const context = useContext(NosecountContext);
    if (!context) {
        return {
            event: undefined,
            mode: CountViewMode.NORMAL,
            selectEvent: () => { },
            selectMode: () => { }
        };
    }
    return context;
};