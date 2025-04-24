import { ApiAction, ApiErrorResponse } from "../global";

export class GetRenderedCommonBadgesApiAction implements ApiAction<any, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "admin/export/badges/user";
    rawResponse?: boolean = true;
}

export class GetRenderedFursuitBadgesApiAction implements ApiAction<any, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "admin/export/badges/fursuits";
    rawResponse?: boolean = true;
}

export class RemindBadgesApiAction implements ApiAction<any, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "admin/mail-reminders/user-badge-upload";
}

export class RemindFursuitBadgesApiAction implements ApiAction<any, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "admin/mail-reminders/fursuit-badge-upload";
}

export class RemindOrderLinkApiAction implements ApiAction<any, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "admin/mail-reminders/order-linking";
}