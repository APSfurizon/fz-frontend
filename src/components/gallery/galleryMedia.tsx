import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import Image from "next/image";
import "@/styles/misc/gallery/upload/uploadedMedia.css";
import { ChangeEvent, MouseEvent } from "react";
import { useTranslations } from "next-intl";

type GalleryMediaProps = {
    image: GalleryUploadedMedia,
    selected: boolean,
    onSelect: (id: number, selected: boolean) => void,
    checkbox?: boolean,
    onClick(image: GalleryUploadedMedia): void
}

export default function GalleryMedia(props: Readonly<GalleryMediaProps>) {
    const t = useTranslations();
    const imageSource = props.image.thumbnailMedia?.mediaUrl ?? EMPTY_PROFILE_PICTURE_SRC;
    const checkEvent = (e?: MouseEvent<HTMLDivElement> | ChangeEvent<HTMLInputElement>) => {
        if (!props.checkbox) return;
        props.onSelect(props.image.id, !props.selected);
    }
    const onSelectClick = (e: MouseEvent<HTMLInputElement>) => {
        e.stopPropagation();
    }

    return <div className="gallery-media"
        aria-roledescription="image"
        tabIndex={0}
        onClick={() => props.checkbox ? checkEvent() : props.onClick(props.image)}>
        {props.checkbox &&
            <input type="checkbox"
                tabIndex={0}
                checked={props.selected}
                className="gallery-media__selection"
                onChange={checkEvent}
                onClick={onSelectClick} />
        }
        <object data={imageSource}
            draggable={false}
            className="gallery-media__thumbnail"
            aria-valuetext="thumbnail"
            width={140}
            height={140}
            type={props.image.thumbnailMedia?.mimeType ?? "image/webp"}>
            <img draggable="false"
                className="gallery-media__thumbnail"
                alt="thumbnail"
                width={140}
                height={140}
                src={EMPTY_PROFILE_PICTURE_SRC} />
        </object>
    </div>
}