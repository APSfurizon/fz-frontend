import { ApiRequest } from "../../networking/types";

export interface GalleryUpdateBody extends ApiRequest {
  uploadIds: number[];
  newStatus?: string;
  newPhotographerUserId?: number;
  newEventUid?: number;
  newRepostPermissions?: string;
}
