import { buildSearchParams } from "@/lib/utils";
import { MobileApiAction } from "./networking/types";
import { ApiErrorResponse } from "./networking/types";
import { RequestType } from "./networking/types";

export class LoadScheduleActivitiesApiAction extends MobileApiAction<Response, ApiErrorResponse> {
  method = RequestType.GET;
  urlAction = "server/loadEventi";
  rawResponse = true;

  static getParams() {
    return buildSearchParams({ id: "attivita" });
  }
}
