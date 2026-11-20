import { ConventionEvent } from "../../counts";
import { MediaData } from "../../media";
import { ApiResponse } from "../../networking/types";
import { UserData } from "../../user/main";

export interface ExploreEvent {
  event: ConventionEvent;
  cardDisplayMedia: MediaData;
  cardThumbnailMedia: MediaData;
  photoNumber: number;
}

export interface ExploreEventsApiResponse extends ApiResponse {
  events: ExploreEvent[];
}

export interface ExplorePhotographer {
  user: UserData;
  photoNumber: number;
  officialPhotographer: boolean;
}

export interface ExplorePhotographersApiResponse extends ApiResponse {
  photographers: ExplorePhotographer[];
}
