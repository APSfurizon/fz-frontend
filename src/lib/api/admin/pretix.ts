import { ApiAction } from "../networking/types";
import { ApiErrorResponse } from "../networking/types";
import { ApiResponse } from "../networking/types";
import { RequestType } from "../networking/types";

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
