import { useFormContext } from "@/components/input/dataForm";
import { useTranslations } from "next-intl";
import { DragEvent, useCallback, useEffect } from "react";
import "@/styles/misc/gallery/upload/filePicker.css";
import Icon from "@/components/icon";
import Button from "@/components/input/button";

type GalleryFilePickerProps = {
    onFilesSelected: (files: File[]) => void
};

function isSupportedMedia(data: DataTransferItem) {
    return ["image", "video"].includes(data.type.split("/")[0]);
}

export default function GalleryFilePicker(props: Readonly<GalleryFilePickerProps>) {
    const { formLoading } = useFormContext();
    const t = useTranslations();

    useEffect(() => {
        const handler = function (e: globalThis.DragEvent) {
            if ([...e.dataTransfer?.items ?? []].some((item) => item.kind === "file")) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
        window.addEventListener("drop", handler);
        return () => window.removeEventListener("drop", handler);
    })

    const dragOverHandler = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (formLoading) {
            e.dataTransfer.dropEffect = "none";
            return;
        }
        const fileItems = [...e.dataTransfer.items].filter(
            (item) => item.kind === "file",
        );
        if (fileItems.length > 0) {
            e.dataTransfer.dropEffect = !fileItems.some(isSupportedMedia)
                ? "none"
                : "copy";
        }
    }, []);

    const dropHandler = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const fileItems = [...e.dataTransfer.items].filter(item => item.kind === "file");
        if (fileItems.some(d => !isSupportedMedia(d))) { return; }
        props.onFilesSelected(fileItems.map(v => v.getAsFile()).filter(v => !!v));
    }, []);

    return <div className="gallery-file-picker rounded-m"
        role="region"
        onDragOver={dragOverHandler}
        onDrop={dropHandler}>
        <div className="prompt vertical-list flex-horizontal-center flex-center">
            <span className="title horizontal-list flex-vertical-center flex-horizontal-center gap-2mm">
                <Icon icon="CLOUD_UPLOAD"></Icon>
                {t.rich("misc.gallery.upload.form.picker.hint", {
                    f: chunks => <Button>{chunks}</Button>
                })}
            </span>
        </div>
    </div>
}