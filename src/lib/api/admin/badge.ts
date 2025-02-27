import { ApiAction, ApiErrorResponse } from "../global";

export class GetRenderedBadgesApiAction implements ApiAction<any, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "admin/get-badges-to-print";
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