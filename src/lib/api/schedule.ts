import { buildSearchParams } from "@/lib/utils";
import { ApiErrorResponse, MobileApiAction, RequestType } from "./global";

export class LoadScheduleActivitiesApiAction extends MobileApiAction<Response, ApiErrorResponse> {
    method = RequestType.GET;
    urlAction = "server/loadEventi";
    rawResponse = true;

    static getParams() {
        return buildSearchParams({ id: "attivita" });
    }
}