import { ApiAction, ApiErrorResponse, RequestType } from "../networking";
import { BookingOrderResponse, ShopLinkResponse } from "./types";

export class BookingOrderApiAction extends ApiAction<BookingOrderResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "orders-workflow/get-full-status";
}

export class ShopLinkApiAction extends ApiAction<ShopLinkResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "orders-workflow/generate-pretix-shop-link";
}

export class OrderEditLinkApiAction extends ApiAction<ShopLinkResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "orders-workflow/get-order-edit-link";
}

export class OrderRetryLinkApiAction extends ApiAction<ShopLinkResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "orders-workflow/get-order-retry-payment-link";
}

export class ConfirmMembershipDataApiAction extends ApiAction<boolean, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.POST;
  urlAction = "membership/mark-personal-user-information-as-updated";
}
