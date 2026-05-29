"use client"
import { SyntheticEvent, useEffect, useState } from "react";
import Modal from "@/components/modal";

type ImagePreviewModalProps = Readonly<{
    imageUrl: string;
    alt: string;
    thumbSize?: number;
    title?: string;
}>;

function formatFileSize(bytes: number) {
    if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    if (bytes >= 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${bytes} B`;
}

export default function ImagePreviewModal({
    imageUrl,
    alt,
    thumbSize = 108,
    title = "Anteprima immagine",
}: ImagePreviewModalProps) {
    const [open, setOpen] = useState(false);
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
    const [fileSize, setFileSize] = useState<number | null>(null);
    const HISTORY_MODAL_KEY = "__imagePreviewModal";

    const updateImageSize = (e: SyntheticEvent<HTMLImageElement>) => {
        setImageSize({
            width: e.currentTarget.naturalWidth,
            height: e.currentTarget.naturalHeight,
        });
    };

    const closeModal = () => {
        const currentState = window.history.state;
        if (currentState && currentState[HISTORY_MODAL_KEY]) {
            window.history.back();
            return;
        }
        setOpen(false);
    };

    useEffect(() => {
        if (!open) return;

        const handlePopState = () => setOpen(false);
        const baseState = (window.history.state && typeof window.history.state === "object") ? window.history.state : {};

        window.history.pushState({ ...baseState, [HISTORY_MODAL_KEY]: true }, "");
        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [open]);

    useEffect(() => {
        if (!open || fileSize !== null) return;

        const controller = new AbortController();

        fetch(imageUrl, { signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) return;

                const contentLength = response.headers.get("content-length");
                if (contentLength) {
                    setFileSize(Number(contentLength));
                    return;
                }

                const blob = await response.blob();
                setFileSize(blob.size);
            })
            .catch(() => {
                // Ignore preview metadata failures; the image itself can still be shown.
            });

        return () => controller.abort();
    }, [fileSize, imageUrl, open]);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                title={title}
                style={{
                    width: thumbSize,
                    height: thumbSize,
                    display: "inline-block",
                    padding: 0,
                    border: "1px solid #ffffff22",
                    borderRadius: 6,
                    overflow: "hidden",
                    background: "transparent",
                    cursor: "zoom-in",
                    flexShrink: 0,
                }}
            >
                <img
                    src={imageUrl}
                    alt={alt}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
            </button>

            <Modal
                open={open}
                onClose={closeModal}
                closeOnOverlayClick
                title={title}
                style={{ width: "min(96vw, 1100px)" }}
            >
                <div className="horizontal-list flex-center" style={{ width: "100%", padding: "0.25em 0 0.5em 0" }}>
                    <div className="vertical-list gap-2mm flex-center" style={{ width: "100%", alignItems: "center" }}>
                        <img
                            src={imageUrl}
                            alt={alt}
                            onLoad={updateImageSize}
                            style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: 8 }}
                        />
                        {(imageSize || fileSize !== null) && (
                            <span className="title small color-subtitle">
                                {imageSize ? `${imageSize.width} x ${imageSize.height}px` : ""}
                                {imageSize && fileSize !== null ? " • " : ""}
                                {fileSize !== null ? formatFileSize(fileSize) : ""}
                            </span>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
}
