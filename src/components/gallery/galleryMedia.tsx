import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import "@/styles/misc/gallery/upload/uploadedMedia.css";
import { CSSProperties, MouseEvent } from "react";

type GalleryMediaProps = {
  source: GalleryUploadedMedia;
  selected: boolean;
  onSelect: (id: number, selected: boolean, shift: boolean) => void;
  checkbox?: boolean;
  onClick(image: GalleryUploadedMedia): void;
  width: number;
  height: number;
  style?: CSSProperties;
};

export default function GalleryMedia(props: Readonly<GalleryMediaProps>) {
  const imageSource = props.source.thumbnailMedia?.mediaUrl ?? EMPTY_PROFILE_PICTURE_SRC;
  const onSelectClick = (e?: MouseEvent<HTMLElement>) => {
    e?.stopPropagation();
    props.onSelect(props.source.id, !props.selected, e?.shiftKey ?? false);
  };
  const checkEvent = () => {
    if (!props.checkbox) return;
    onSelectClick(undefined);
  };

  return (
    <div
      className="gallery-media"
      style={props.style}
      aria-roledescription="image"
      tabIndex={0}
      onClick={(e) => (props.checkbox ? onSelectClick(e) : props.onClick(props.source))}
      onContextMenu={() => props.onClick(props.source)}
    >
      {props.checkbox && (
        <input
          type="checkbox"
          tabIndex={0}
          checked={props.selected}
          className="gallery-media__selection"
          onChange={checkEvent}
          onClick={onSelectClick}
        />
      )}
      <object
        data={imageSource}
        draggable={false}
        className="gallery-media__thumbnail"
        aria-valuetext="thumbnail"
        width={props.width}
        height={props.height}
        type={props.source.thumbnailMedia?.mimeType ?? "image/webp"}
      >
        <img
          draggable="false"
          className="gallery-media__thumbnail"
          alt="thumbnail"
          width={props.width}
          height={props.height}
          src={EMPTY_PROFILE_PICTURE_SRC}
        />
      </object>
    </div>
  );
}
