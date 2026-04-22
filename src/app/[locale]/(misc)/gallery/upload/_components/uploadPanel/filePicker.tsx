import { useFormContext } from "@/components/input/dataForm";
import { useTranslations } from "next-intl";
import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from "react";
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
    const fileRef = useRef<HTMLInputElement>(null!);
    const [hover, setHover] = useState(false);

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
        if (fileItems.length > 0 && fileItems.some(isSupportedMedia)) {
            e.dataTransfer.dropEffect = "copy";
            setHover(true);
        }
    }, []);

    const dropHandler = useCallback((e: DragEvent<HTMLDivElement>) => {
        setHover(false);
        e.preventDefault();
        const fileItems = [...e.dataTransfer.items].filter(item => item.kind === "file");
        if (fileItems.some(d => !isSupportedMedia(d))) { return; }
        props.onFilesSelected(fileItems.map(v => v.getAsFile()).filter(v => !!v));
    }, []);

    const filePickerHandler = useCallback((e: ChangeEvent) => {
        if (!fileRef.current?.files?.length) return;
        props.onFilesSelected([...fileRef.current.files]);
        fileRef.current.value = "";
    }, []);

    const s = undefined;

    return <div className={`gallery-file-picker rounded-m ${hover ? "hover" : ""}`}
        role="region"
        onDragOver={dragOverHandler}
        onDrop={dropHandler}
        onDragLeave={() => setHover(false)}>
        <div className="prompt vertical-list flex-horizontal-center flex-center">
            <input type="file"
                className="suppressed-input"
                multiple
                ref={fileRef}
                accept="image/*, video/*"
                onChange={filePickerHandler} />
            <span className="title horizontal-list flex-vertical-center flex-horizontal-center gap-2mm">
                <Icon icon="CLOUD_UPLOAD"></Icon>
                {t.rich("misc.gallery.upload.form.picker.hint", {
                    f: chunks => <Button onClick={() => fileRef.current?.showPicker()}>{chunks}</Button>
                })}
            </span>
        </div>
    </div>
}