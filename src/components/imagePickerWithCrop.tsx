'use client'
import { useEffect, useRef, useState } from "react";
import { Cropper, ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import Button from "@/components/input/button";
import Modal from "@/components/modal";
import ImagePreviewModal from "@/components/imagePreviewModal";
import Icon from "@/components/icon";
import { useModalUpdate } from "@/components/context/modalProvider";
import { useTranslations } from "next-intl";

interface ImagePickerWithCropProps {
    onImageSelected: (file: File) => void;
    imageFile?: File | null;
    onImageRemove?: () => void;
    label?: string;
    title?: string;
    thumbSize?: number;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

export default function ImagePickerWithCrop({
    onImageSelected,
    imageFile,
    onImageRemove,
    label,
    title = "Image",
    thumbSize = 108,
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.72,
}: ImagePickerWithCropProps) {
    const t = useTranslations();
    const { showModal } = useModalUpdate();

    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [cropSource, setCropSource] = useState<string>("");
    const [cropFileName, setCropFileName] = useState("image.jpg");
    const [previewUrl, setPreviewUrl] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cropperRef = useRef<ReactCropperElement>(null);

    // Manage preview URL lifecycle
    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl("");
            return;
        }
        const localUrl = URL.createObjectURL(imageFile);
        setPreviewUrl(localUrl);
        return () => URL.revokeObjectURL(localUrl);
    }, [imageFile]);

    const handleFileSelected = (file: File | null) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            showModal(t("common.error"), <span>{t("furpanel.admin.security_management.incidents.invalid_image")}</span>);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setCropFileName(file.name || "image.jpg");
            setCropSource(String(reader.result || ""));
            setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelected(e.target.files?.[0] ?? null);
        e.currentTarget.value = "";
    };

    const applyCroppedImage = () => {
        const cropper = cropperRef.current?.cropper;
        if (!cropper) return;

        const canvas = cropper.getCroppedCanvas({
            maxWidth,
            maxHeight,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: "high",
            fillColor: "#000"
        });

        if (!canvas) {
            showModal(t("common.error"), <span>{t("furpanel.admin.security_management.incidents.invalid_image")}</span>);
            return;
        }

        canvas.toBlob((blob) => {
            if (!blob) {
                showModal(t("common.error"), <span>{t("furpanel.admin.security_management.incidents.invalid_image")}</span>);
                return;
            }

            const normalizedName = (cropFileName || "image").replace(/\.[^/.]+$/, "") + ".jpg";
            const processedFile = new File([blob], normalizedName, { type: "image/jpeg" });

            onImageSelected(processedFile);
            setCropModalOpen(false);
            setCropSource("");
        }, "image/jpeg", quality);
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleInputChange}
            />

            {!imageFile && (
                <Button icon="PHOTO_CAMERA" onClick={() => fileInputRef.current?.click()}>
                    {label || t("furpanel.admin.security_management.incidents.screenshot")}
                </Button>
            )}

            {previewUrl && (
                <div className="horizontal-list gap-2mm flex-vertical-center" style={{ flexWrap: "wrap" }}>
                    <ImagePreviewModal
                        imageUrl={previewUrl}
                        alt={imageFile?.name || label || t("furpanel.admin.security_management.incidents.screenshot")}
                        thumbSize={thumbSize}
                        title={title}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            onImageRemove?.();
                        }}
                        title="Rimuovi immagine"
                        className="rounded-l"
                        style={{
                            width: 34,
                            height: 34,
                            border: "1px solid #ffffff22",
                            background: "#0e1621",
                            color: "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer"
                        }}>
                        <Icon icon="CLOSE" />
                    </button>
                </div>
            )}

            {imageFile && <span className="title small color-subtitle">{imageFile.name}</span>}

            <Modal
                open={cropModalOpen}
                onClose={() => {
                    setCropModalOpen(false);
                    setCropSource("");
                }}
                title={title}
                icon="PHOTO_CAMERA"
                style={{ width: "min(95vw, 760px)" }}>
                <div className="vertical-list gap-3mm" style={{ padding: "0.9em" }}>
                    {cropSource && (
                        <Cropper
                            src={cropSource}
                            style={{ width: "100%", height: 420 }}
                            initialAspectRatio={NaN}
                            viewMode={1}
                            guides
                            background={false}
                            autoCropArea={0.9}
                            responsive
                            checkOrientation={false}
                            ref={cropperRef}
                        />
                    )}
                    <span className="title small color-subtitle">{t("furpanel.admin.security_management.incidents.screenshot")}: {cropFileName}</span>
                    <div className="horizontal-list gap-2mm" style={{ flexWrap: "wrap" }}>
                        <Button onClick={() => {
                            setCropModalOpen(false);
                            setCropSource("");
                        }}>{t("furpanel.admin.security_management.incidents.cancel")}</Button>
                        <Button icon="CHECK" onClick={applyCroppedImage}>{t("furpanel.admin.security_management.incidents.update")}</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
