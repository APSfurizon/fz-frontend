import { runRequest } from "../../global";
import { GalleryUploadedMediaStatus } from "../types";
import { GalleryUpdateFormApiAction } from "./api";

export function setStatus(ids: number[], status: GalleryUploadedMediaStatus) {
  return runRequest({
    action: new GalleryUpdateFormApiAction(),
    body: {
      uploadIds: ids,
      newStatus: status,
    },
  });
}
