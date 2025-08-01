import { ApiAction, ApiErrorResponse, ApiMessageResponse, RequestType } from "../global";

export class PingApiAction extends ApiAction<ApiMessageResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/ping";
}