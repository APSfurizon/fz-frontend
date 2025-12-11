import { Board, OrderData } from "./booking";
import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "./global";
import { RoomData } from "./room";
import { UserData, ExtraDays } from "./user";

export interface ExchangeStatusApiResponse extends ApiResponse {
    sourceUser: UserData,
    sourceConfirmed: boolean,
    targetUser: UserData,
    targetConfirmed: boolean,
    action: "room" | "order",
    fullOrderExchange?: OrderData,
    sourceRoomExchange?: RoomData,
    sourceExtraDays: ExtraDays,
    targetRoomInfoHidden: boolean,
    targetRoomExchange: RoomData,
    targetExtraDays?: ExtraDays,
    targetBoard?: Board
}

export class ExchangeStatusApiAction extends ApiAction<ExchangeStatusApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "room/exchange/info";
}

export interface ExchangeUpdateApiData {
    exchangeId: number,
    confirm: boolean
}

export class ExchangeUpdateApiAction extends ApiAction<boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "room/exchange/update";
}