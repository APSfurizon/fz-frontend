import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "../global";

export class ReloadEventApiAction extends ApiAction<ApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "cache/pretix/reload-struct";
}

export class ReloadOrdersApiAction extends ApiAction<ApiResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    urlAction = "cache/pretix/reload-orders";
}