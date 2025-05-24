import { ApiAction, ApiErrorResponse, RequestType } from "../global";

export class GetRenderedCommonBadgesApiAction extends ApiAction<Response, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/export/badges/user";
    rawResponse?: boolean = true;
}

export class GetRenderedFursuitBadgesApiAction extends ApiAction<Response, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/export/badges/fursuits";
    rawResponse?: boolean = true;
}

export class RemindBadgesApiAction extends ApiAction<any, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/mail-reminders/user-badge-upload";
}

export class RemindFursuitBadgesApiAction extends ApiAction<any, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/mail-reminders/fursuit-badge-upload";
}

export class RemindOrderLinkApiAction extends ApiAction<any, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/mail-reminders/order-linking";
}

export class RemindRoomsNotFullApiAction extends ApiAction<any, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/mail-reminders/room-not-full";
}