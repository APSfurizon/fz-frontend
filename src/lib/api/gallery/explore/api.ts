import { ApiAction, ApiErrorResponse, ApiResponse, RequestType } from "../../global";
import { GalleryMediaApiResponse } from "../types";
import { ExploreEvent, ExploreEventsApiResponse, ExplorePhotographer, ExplorePhotographersApiResponse } from "./type";

export class ExploreEventsApiAction extends ApiAction<ExploreEventsApiResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "gallery/pub/events";
}

export class ExploreEventApiAction extends ApiAction<ExploreEvent & ApiResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  hasPathParams = true;
  urlAction = "gallery/pub/events/{id}";
}

export class ExplorePhotographersApiAction extends ApiAction<ExplorePhotographersApiResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "gallery/pub/photographers";
}

export class ExplorePhotographerApiAction extends ApiAction<ExplorePhotographer & ApiResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  hasPathParams = true;
  urlAction = "gallery/pub/photographers/{id}";
}

export class ExploreApiAction extends ApiAction<GalleryMediaApiResponse, ApiErrorResponse> {
  authenticated = true;
  method = RequestType.GET;
  urlAction = "gallery/pub/list";
}
