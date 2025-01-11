import { OrderData } from "./booking";
import { RoomTypeInfo } from "./flows/roomOrderFlow";
import { ApiAction, ApiErrorResponse, ApiResponse } from "./global";
import { RoomData } from "./room";
import { UserData } from "./user";

export interface ExchangeStatusApiResponse extends ApiResponse {
    sourceUser: UserData,
    sourceConfirmed: boolean,
    targetUser: UserData,
    targetConfirmed: boolean,
    action: "room" | "order",
    fullOrderExchange?: OrderData,
    sourceRoomExchange?: RoomData,
    sourceExtraDays: "NONE" | "EARLY" | "LATE" | "BOTH",
    targetRoomInfoHidden: boolean,
    targetRoomExchange: RoomData,
    targetExtraDays?: "NONE" | "EARLY" | "LATE" | "BOTH",
}

export class ExchangeStatusApiAction implements ApiAction<ExchangeStatusApiResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "room/exchange/info";
    onSuccess: (status: number, body?: ExchangeStatusApiResponse) => void = (status: number, body?: ExchangeStatusApiResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export interface ExchangeUpdateApiData {
    exchangeId: number,
    confirm: boolean
}

export class ExchangeUpdateApiAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "room/exchange/update";
    onSuccess: (status: number, body?: Boolean) => void = (status: number, body?: Boolean) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}