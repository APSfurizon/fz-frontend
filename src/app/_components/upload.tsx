"use client"
import { useTranslations } from 'next-intl';
import { EMPTY_USER_PICTURE, UserPictureData } from '../_lib/api/user';
import { ChangeEvent, ChangeEventHandler, MouseEvent, useEffect, useRef, useState } from 'react';
import { EMPTY_PROFILE_PICTURE_SRC } from '../_lib/constants';
import Icon, { ICONS } from './icon';
import Image from 'next/image';
import { getImageSettings, Coordinates, ImageSettings, Media, VALID_FILE_TYPES, validateImage, HandleSettings } from '../_lib/components/upload';
import Button from './button';
import "../styles/components/userUpload.css";
import Modal from './modal';
import { useModalUpdate } from '../_lib/context/modalProvider';

export default function Upload ({cropTitle, initialData, fieldName, isRequired=false, label, readonly=false, requireCrop = false, size=96, uploadType = "profile"}: Readonly<{
    cropTitle?: string,
    initialData?: number,
    fieldName?: string,
    isRequired?: boolean,
    label?: string,
    requireCrop?: boolean,
    readonly?: boolean,
    size?: number,
    uploadType?: "full" | "profile"
}>) { 
    const t = useTranslations('components');
    const tcommon = useTranslations('common');
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [media, setMedia] = useState<Media | undefined>();
    const inputRef = useRef<HTMLInputElement> (null);
    {/* Crop dialog */}
    const previewRef = useRef<HTMLImageElement> (null);
    const canvasRef = useRef<HTMLCanvasElement> (null);
    const containerRef = useRef<HTMLDivElement> (null);
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [preview, setPreview] = useState<ImageBitmap>();
    const [previewString, setPreviewString] = useState<string>();
    const [imageSettings, setImageSettings] = useState<ImageSettings>();
    const [topHandle, setTopHandle] = useState<HandleSettings>({coordinates: {x: 0, y:0}, active: false});
    const [bottomHandle, setBottomHandle] = useState<HandleSettings>({coordinates: {x: 100, y:100}, active: false});
    const {showModal} = useModalUpdate();

    /**Loads the initial value media via its id */
    useEffect(()=> {
        if (initialData) {

        }
    }, [initialData]);

    const openFileDialog = () => {
        inputRef.current?.click();
    };

    /**Whenever a user chooses a picture file */
    const onFileChosen = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files && e.currentTarget.files.length == 1) {
            validateImage(inputRef.current!.files![0]).then((image)=>{
                if (requireCrop) {
                    setPreview(image);
                    if (previewString) URL.revokeObjectURL(previewString);
                    setPreviewString(URL.createObjectURL(inputRef.current!.files![0]));
                    setImageSettings(getImageSettings(image, previewRef.current!));
                    setCropDialogOpen(true);
                } else {
                    onFileUpload ();
                }
                setError(false);
            }).catch((message: String)=>{
                showModal (tcommon("error"), <span className='error'>{t(`upload.${message}`)}</span>)
                setError(true);
            })
        }
    };

    /**To re-render handles */
    useEffect(()=> {
        const ctx = canvasRef.current!.getContext("2d");
        if (ctx == null) return;
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.setLineDash([10, 5, 10]);
        ctx.lineWidth = 5;
        ctx.rect(topHandle.coordinates.x + 2.5,
            topHandle.coordinates.y + 2.5, 
            bottomHandle.coordinates.x - topHandle.coordinates.x - 2.5,
            bottomHandle.coordinates.y - topHandle.coordinates.y - 2.5);
        ctx.stroke();
        
    }, [topHandle, bottomHandle, imageSettings]);

    useEffect(() => {
        if (isLoading || !preview) return;
        if (previewRef.current) {
            const observer = new ResizeObserver((entries) => {
                onPreviewLoaded();
            });

            observer.observe(previewRef.current);

            // Cleanup function
            return () => {
                observer.disconnect();
            };
        }
    }, [cropDialogOpen]);

    /**
     * When the user has chosen a file to upload or accepted the chosen file's crop settings
     */
    const onFileUpload = () => {

    };

    const onPreviewLoaded = () => {
        if (isLoading || !preview) return;
        setImageSettings(getImageSettings(preview, previewRef.current!));
    };

    /**
     * When the user wants to delete the uploaded media
     */
    const onDeleteRequest = () => {
        
    }

    const getCropCoordinates = (e: MouseEvent): Coordinates => {
        var rect = previewRef.current!.getBoundingClientRect();
        return {
            x: Math.min(Math.max(Math.round(e.clientX - rect.left), 0), rect.width),
            y: Math.min(Math.max(Math.round(e.clientY - rect.top), 0), rect.height)
        };
    }
    
    const containerRect = containerRef.current?.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const [renderTopHandle, renderBottomHandle] = [
        {
            x: ((canvasRect?.left ?? 0) - (containerRect?.left ?? 0)) + topHandle.coordinates.x,
            y: ((canvasRect?.top ?? 0) - (containerRect?.top ?? 0)) + topHandle.coordinates.y
        },
        {
            x: ((canvasRect?.left ?? 0) - (containerRect?.left ?? 0)) + bottomHandle.coordinates.x,
            y: ((canvasRect?.top ?? 0) - (containerRect?.top ?? 0)) + bottomHandle.coordinates.y
        }
    ]

    return <>
        <label htmlFor={fieldName} className={`upload-label title semibold small margin-bottom-1mm ${isRequired ? "required" : ""}`}>{label}</label>
        <input tabIndex={-1} className="suppressed-input" type="text" name={fieldName} value={media?.id} required={isRequired}></input>
        <div className="upload-container vertical-list flex-vertical-center rounded-l gap-2mm">
            <div className={`image-container rounded-s ${error ? "danger" : ""}`}>
                <Image className="rounded-s upload-picture" src={media?.path ?? EMPTY_PROFILE_PICTURE_SRC}
                    alt={t('upload.alt_preview_image')} width={size} height={size}
                    style={{aspectRatio: "1", maxWidth: size, maxHeight: size, objectFit: "contain"}}>
                </Image>
            </div>
            <div className="horizontal-list gap-2mm">
                <Button title={t('upload.open')} onClick={()=>openFileDialog()} iconName={ICONS.CLOUD_UPLOAD} disabled={readonly} busy={isLoading}>{!media && t('upload.open')}</Button>
                {media && <Button title={t('upload.upload')} className="danger" onClick={()=>onDeleteRequest()} iconName={ICONS.DELETE} disabled={readonly} busy={isLoading}></Button>}
            </div>
        </div>

        {/* Form data */}
        <form className="suppressed-input">
            <input type="hidden" value={uploadType}></input>
            <input type="file" accept={VALID_FILE_TYPES.join(',')} ref={inputRef} onChange={onFileChosen}></input>
        </form>

        {/* Crop dialog */}
        <Modal open={cropDialogOpen} title={cropTitle ?? t("upload.crop")} onClose={()=> setCropDialogOpen(false)}>
            <div className="crop-container" ref={containerRef} onResize={()=>onPreviewLoaded()}>
                <Image width={256} height={256} alt="" src={previewString ?? EMPTY_PROFILE_PICTURE_SRC}
                    className={"crop-image"} style={{objectFit: "contain"}} ref={previewRef}
                    onLoad={()=>onPreviewLoaded()}>
                </Image>
                <canvas ref={canvasRef} className="crop-canvas" width={previewRef.current?.clientWidth}
                    height={previewRef.current?.clientHeight}>
                </canvas>
                <button className={`handle ${topHandle.active ? "active" : ""}`} style={{top: renderTopHandle.y, left: renderTopHandle.x}}
                    onPointerDown={()=>setTopHandle({...topHandle, active: true})}
                    onPointerLeave={()=>setTopHandle({...topHandle, active: false})}
                    onPointerUp={()=>setTopHandle({...topHandle, active: false})}></button>
                <button className={`handle ${bottomHandle.active ? "active" : ""}`} style={{top: renderBottomHandle.y, left: renderBottomHandle.x}}
                    onPointerDown={()=>setBottomHandle({...bottomHandle, active: true})}
                    onPointerLeave={()=>setBottomHandle({...bottomHandle, active: false})}
                    onPointerUp={()=>setBottomHandle({...bottomHandle, active: false})}></button>
            </div>
            <span>{imageSettings?.width} - {imageSettings?.height}. Resize factor: {imageSettings?.resizeFactor}</span>
            <div className="bottom-toolbar">
                <Button title={tcommon('cancel')} className="danger" onClick={()=>onDeleteRequest()}
                    iconName={ICONS.CANCEL} disabled={readonly} busy={isLoading}>{tcommon('cancel')}</Button>
                <div className="spacer"></div>
                <Button title={t('upload.upload')} onClick={()=>openFileDialog()}
                    iconName={ICONS.CLOUD_UPLOAD} disabled={readonly} busy={isLoading}>{!media && t('upload.upload')}</Button>    
            </div>
        </Modal>    
    </>
}