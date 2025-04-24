import { ExtraDaysType, OrderData } from "./booking";
import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "./global";
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
    sourceExtraDays: ExtraDaysType,
    targetRoomInfoHidden: boolean,
    targetRoomExchange: RoomData,
    targetExtraDays?: ExtraDaysType,
}

export class ExchangeStatusApiAction implements ApiAction<ExchangeStatusApiResponse, ApiErrorResponse> {
    authenticated = true;
    method!: RequestType.GET;
    urlAction = "room/exchange/info";
}

export interface ExchangeUpdateApiData {
    exchangeId: number,
    confirm: boolean
}

export class ExchangeUpdateApiAction implements ApiAction<Boolean, ApiErrorResponse> {
    authenticated = true;
    method!: RequestType.POST;
    urlAction = "room/exchange/update";
}