import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "./networking/types";
import { Board, OrderData } from "./reservation";
import { RoomData } from "./room";
import { ExtraDays, UserData } from "./user";

export interface ExchangeStatusApiResponse extends ApiResponse {
  sourceUser: UserData;
  sourceConfirmed: boolean;
  targetUser: UserData;
  targetConfirmed: boolean;
  action: "room" | "order";
  fullOrderExchange?: OrderData;
  sourceRoomExchange?: RoomData;
  sourceExtraDays: ExtraDays;
  sourceBoard?: Board;
  targetRoomInfoHidden: boolean;
  targetRoomExchange: RoomData;
  targetExtraDays?: ExtraDays;
  targetBoard?: Board;
}

export class ExchangeStatusApiAction extends ApiAction<ExchangeStatusApiResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "room/exchange/info";
}

export interface ExchangeUpdateApiData {
  exchangeId: number;
  confirm: boolean;
}

export class ExchangeUpdateApiAction extends ApiAction<boolean, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.POST;
  urlAction = "room/exchange/update";
}
