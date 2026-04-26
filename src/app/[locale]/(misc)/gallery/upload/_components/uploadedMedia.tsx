import { GalleryUploadedMedia } from "@/lib/api/gallery/upload/types";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import Image from "next/image";
import "@/styles/misc/gallery/upload/uploadedMedia.css";
import { ChangeEvent, MouseEvent } from "react";

type UploadedImageProps = {
    image: GalleryUploadedMedia,
    selected: boolean,
    onSelect: (id: number, selected: boolean) => void
}

export default function UploadedImage(props: Readonly<UploadedImageProps>) {
    const imageSource = props.image.thumbnailMedia?.mediaUrl ?? EMPTY_PROFILE_PICTURE_SRC;
    const checkEvent = (e: MouseEvent<HTMLDivElement> | ChangeEvent<HTMLInputElement>) => {
        props.onSelect(props.image.id, !props.selected);
        e.stopPropagation();
    }

    return <div className="uploaded-media rounded-m"
        onDoubleClick={checkEvent}>
        <input type="checkbox" checked={props.selected} className="selection" onChange={checkEvent} />
        <Image className="thumbnail" alt="thumbnail" width={140} height={140} src={imageSource} />
    </div>
}