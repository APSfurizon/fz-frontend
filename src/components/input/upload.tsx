"use client"
import { useTranslations } from 'next-intl';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { EMPTY_PROFILE_PICTURE_SRC, PROFILE_UPLOAD_MAX_SIZE, FULL_UPLOAD_MAX_WIDTH, FULL_UPLOAD_MAX_HEIGHT  } from '@/lib/constants';
import { ICONS } from '@/components/icon';
import Image from 'next/image';
import { VALID_FILE_TYPES, validateImage, imageToBlob, scaleBlob } from '@/lib/components/upload';
import Button from '@/components/input/button';
import Modal from '@/components/modal';
import { useModalUpdate } from '@/components/context/modalProvider';
import "@/styles/components/userUpload.css";
import { MediaData } from '@/lib/api/media';
import { areEquals, getImageUrl } from '@/lib/utils';
import { useFormContext } from '@/components/input/dataForm';
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

export default function Upload ({
    children,
    cropTitle,
    initialMedia,
    fieldName,
    required=false,
    label,
    helpText,
    loading=false,
    readonly=false,
    requireCrop = false,
    viewSize=96,
    cropAspectRatio = "square",
    setBlob,
    onDelete
}: Readonly<{
    children?: React.ReactNode,
    cropTitle?: string,
    initialMedia?: MediaData,
    fieldName?: string,
    required?: boolean,
    label?: string,
    helpText?: string,
    loading: boolean,
    requireCrop?: boolean,
    readonly?: boolean,
    viewSize?: number,
    cropAspectRatio?: "any" | "square",
    setBlob?: (blob?: Blob) => any,
    onDelete?: (mediaId: number) => any
}>) { 
    const t = useTranslations();
    const [error, setError] = useState(false);
    const [media, setMedia] = useState<MediaData | undefined>();
    const [lastInitialMedia, setLastInitialMedia] = useState<MediaData>();
    const inputRef = useRef<HTMLInputElement> (null);
    const {showModal} = useModalUpdate();
    
    {/* Crop dialog */}
    const cropperRef = useRef<ReactCropperElement>(null);
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<ImageBitmap>();
    const [previewUrl, setPreviewUrl] = useState<string>();

    // Reset logic
    const { reset = false, globalDisabled = false, onFormChange } = useFormContext();

    /**Loads the initial value media */
    useEffect(()=>{
        if (!areEquals(initialMedia, lastInitialMedia) || reset) {
            setError(false);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(undefined);
            setLastInitialMedia (initialMedia);
            setMedia(initialMedia);
        }
    }, [initialMedia, reset])

    const openFileDialog = () => {
        inputRef.current?.click();
    };

    /**Whenever a user chooses a picture file */
    const onFileChosen = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files && e.currentTarget.files.length == 1) {
            validateImage(inputRef.current!.files![0]).then((image)=>{
                if (requireCrop) {
                    setImageToCrop(image);
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(URL.createObjectURL(inputRef.current!.files![0]));
                    setCropDialogOpen(true);
                } else {
                    onFileUpload (image);
                }
                setError(false);
            }).catch((message: string)=>{
                showModal (t("common.error"), <span className='error'>{t(`components.upload.${message}`)}</span>)
                setError(true);
            })
        }
    };
    
    const onCropCanceled = () => {
        setCropDialogOpen(false);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(undefined);
        onFormChange(fieldName);
    };

    /**
     * When the user confirms the blob
     * @returns the picture's blob
     */
    const onCrop = (): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const cropper = cropperRef.current?.cropper;
            cropper?.getCroppedCanvas().toBlob((blob) => blob ? resolve(blob) : reject(),
                "image/png", 1);
        });
    }

    /**
     * When the user has chosen a file to upload or accepted the chosen file's crop settings
     */
    const onFileUpload = (image: ImageBitmap) => {
        if (!image) return;
        let cropPromise: Promise<Blob>;
        if (requireCrop) {
            cropperRef.current?.cropper.crop();
            cropPromise = onCrop();
        } else {
            cropPromise = imageToBlob(image);
        }
        setImageToCrop(undefined);
        
        cropPromise.then((imageBlob) => {
            const isProfile = cropAspectRatio === 'square';
            scaleBlob(imageBlob, isProfile ? PROFILE_UPLOAD_MAX_SIZE : FULL_UPLOAD_MAX_WIDTH,
                isProfile ? PROFILE_UPLOAD_MAX_SIZE : FULL_UPLOAD_MAX_HEIGHT)
            .then((scaledBlob) => {
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(URL.createObjectURL(scaledBlob));
                if (setBlob) {
                    setBlob(scaledBlob);
                }
                setError(false);
                onFormChange(fieldName);
            }).catch(()=>{
                setError(true);
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(undefined);    
            })
        }).catch (()=> {
            setError(true);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(undefined);
        }).finally(()=>{
            image.close();
            setImageToCrop(undefined);
            setCropDialogOpen(false);
        });
    };

    /**
     * When the user wants to delete the uploaded media
     */
    const onDeleteRequest = () => {
        if (media) {
            if(onDelete) onDelete(media.mediaId);
        } else if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(undefined);
            if(setBlob) setBlob(undefined);
        }
    }

    const isRequired = !globalDisabled && required;

    return <>
        {label && <input tabIndex={-1}
            className="suppressed-input"
            type="text"
            name={fieldName}
            defaultValue={previewUrl ?? ""}
            required={isRequired}/>}
        <div>
            {label && <label htmlFor={fieldName} className={`upload-label margin-bottom-1mm title semibold small ${isRequired ? "required" : ""}`}>
                {label}
            </label>}
            <div className="upload-container vertical-list flex-vertical-center rounded-l gap-2mm">
                <div className={`image-container rounded-s ${error ? "danger" : ""}`}>
                    <Image unoptimized className="upload-picture" src={previewUrl ? previewUrl : getImageUrl(media?.mediaUrl) ?? EMPTY_PROFILE_PICTURE_SRC}
                        alt={t('components.upload.alt_preview_image')} width={viewSize} height={viewSize} quality={100}
                        style={{aspectRatio: "1", maxWidth: viewSize, maxHeight: viewSize, minWidth: viewSize, minHeight: viewSize, objectFit: "cover"}}>
                    </Image>
                </div>
                <div className="vertical-list gap-2mm">
                    {/* Upload button */}
                    {!media && <Button title={t('components.upload.open')} onClick={()=>openFileDialog()}
                        iconName={ICONS.CLOUD_UPLOAD} disabled={readonly || globalDisabled} busy={loading}>
                        {!media && t('components.upload.open')}</Button>}
                    {/* Delete button */}
                    {(media || previewUrl) && <Button title={t('components.upload.delete')} className="danger"
                        onClick={()=>onDeleteRequest()} iconName={ICONS.DELETE} disabled={readonly || globalDisabled}
                        busy={loading}>{t('components.upload.delete')}</Button>}
                </div>
                {children}
            </div>
        </div>
        {helpText && helpText.length > 0 && <span className="help-text tiny descriptive color-subtitle">{helpText}</span>}

        {/* Form data */}
        <div className="suppressed-input">
            <input type="file" accept={VALID_FILE_TYPES.join(',')} ref={inputRef} onChange={onFileChosen}></input>
        </div>

        {/* Crop dialog */}
        <Modal style={{overflow: "visible"}} open={cropDialogOpen} title={cropTitle ?? t("components.upload.crop")}
            onClose={()=> onCropCanceled()} zIndex={505}>
            <Cropper src={previewUrl} initialAspectRatio={1} guides={false} aspectRatio={cropAspectRatio == 'square' ? 1 : undefined} ref={cropperRef}
                zoomable={false} minCropBoxWidth={100} minCropBoxHeight={100} style={{maxHeight: '75vh'}}>
            </Cropper>
            <div className="horizontal-list gap-2mm">
                <Button iconName={ICONS.ROTATE_LEFT} onClick={()=>cropperRef.current?.cropper.rotate(-45)}></Button>
                <Button iconName={ICONS.ROTATE_RIGHT} onClick={()=>cropperRef.current?.cropper.rotate(45)}></Button>
                <div className="spacer"></div>
                <Button iconName={ICONS.RESET_SETTINGS} onClick={()=>cropperRef.current?.cropper.reset()}></Button>
            </div>
            <div className="bottom-toolbar">
                <Button title={t('common.cancel')} className="danger" onClick={()=>onCropCanceled()}
                    iconName={ICONS.CANCEL} disabled={readonly || globalDisabled}
                    busy={loading}>{t('common.cancel')}</Button>
                <div className="spacer"></div>
                <Button title={t('components.upload.upload')} onClick={()=>onFileUpload(imageToCrop!)}
                    iconName={ICONS.CLOUD_UPLOAD} disabled={readonly || globalDisabled}
                     busy={loading}>{!media && t('components.upload.upload')}</Button>    
            </div>
        </Modal>
    </>
}