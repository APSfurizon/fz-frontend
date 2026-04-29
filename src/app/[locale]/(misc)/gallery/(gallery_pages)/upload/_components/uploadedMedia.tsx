import { GalleryUploadedMedia } from "@/lib/api/gallery/upload/types";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import Image from "next/image";
import "@/styles/misc/gallery/upload/uploadedMedia.css";
import { ChangeEvent, MouseEvent } from "react";
import Icon from "@/components/icon";
import { useTranslations } from "next-intl";

type UploadedImageProps = {
    image: GalleryUploadedMedia,
    selected: boolean,
    onSelect: (id: number, selected: boolean) => void,
    checkbox?: boolean,
    onClick(image: GalleryUploadedMedia): void
}

export default function UploadedMedia(props: Readonly<UploadedImageProps>) {
    const t = useTranslations("");
    const imageSource = props.image.thumbnailMedia?.mediaUrl ?? EMPTY_PROFILE_PICTURE_SRC;
    const checkEvent = (e: MouseEvent<HTMLDivElement> | ChangeEvent<HTMLInputElement>) => {
        if (!props.checkbox) return;
        props.onSelect(props.image.id, !props.selected);
        e.stopPropagation();
    }

    return <div className="uploaded-media rounded-m"
        onDoubleClick={checkEvent}
        onClick={() => props.onClick(props.image)}>
        {props.checkbox &&
            <input type="checkbox" checked={props.selected} className="selection" onChange={checkEvent} />
        }
        <Image className="thumbnail" alt="thumbnail" width={140} height={140} src={imageSource} />
    </div>
}