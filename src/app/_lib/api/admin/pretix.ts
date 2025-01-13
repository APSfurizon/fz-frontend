import { ApiAction, ApiErrorResponse, ApiResponse } from "../global";

export class ReloadEventApiAction implements ApiAction<ApiResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "cache/pretix/reload-struct";
    onSuccess: (status: number, body?: ApiResponse) => void = (status: number, body?: ApiResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}

export class ReloadOrdersApiAction implements ApiAction<ApiResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "cache/pretix/reload-orders";
    onSuccess: (status: number, body?: ApiResponse) => void = (status: number, body?: ApiResponse) => {};
    onFail: (status: number, body?: ApiErrorResponse | undefined) => void = () => {};
}