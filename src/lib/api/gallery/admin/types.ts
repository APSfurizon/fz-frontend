import { ApiRequest } from "../../networking/types";

export interface GalleryUpdateBody extends ApiRequest {
  uploadIds: number[];
  newStatus?: string;
  newPhotographerUserId?: number;
  newEventId?: number;
  newRepostPermissions?: string;
}
