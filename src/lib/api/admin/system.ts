import { ApiAction } from "../networking/types";
import { ApiMessageResponse } from "../networking/types";
import { ApiErrorResponse } from "../networking/types";
import { RequestType } from "../networking/types";

export class PingApiAction extends ApiAction<ApiMessageResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "admin/ping";
}
