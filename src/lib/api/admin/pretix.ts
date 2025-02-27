import { ApiAction, ApiErrorResponse, ApiResponse } from "../global";

export class ReloadEventApiAction implements ApiAction<ApiResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "cache/pretix/reload-struct";
}

export class ReloadOrdersApiAction implements ApiAction<ApiResponse, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "POST";
    urlAction = "cache/pretix/reload-orders";
}