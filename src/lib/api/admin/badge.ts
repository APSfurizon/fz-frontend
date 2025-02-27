import { ApiAction, ApiErrorResponse } from "../global";

export class GetRenderedBadgesApiAction implements ApiAction<any, ApiErrorResponse> {
    authenticated = true;
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT" = "GET";
    urlAction = "admin/get-badges-to-print";
    rawResponse?: boolean = true;
}