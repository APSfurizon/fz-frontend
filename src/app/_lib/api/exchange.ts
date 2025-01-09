import { ApiAction, ApiErrorResponse, ApiResponse } from "./global";

export interface ExchangeStatusApiResponse extends ApiResponse {
    action: "room" | "order"
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
    urlAction = "room/exchange/info";
    onSuccess: (status: number, body?: Boolean) => void = (status: number, body?: Boolean) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}