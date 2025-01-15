"use client"
import { useTranslations } from 'next-intl';
import { ChangeEvent, ChangeEventHandler, MouseEvent, PointerEvent, SetStateAction, useEffect, useRef, useState } from 'react';
import { EMPTY_PROFILE_PICTURE_SRC } from '../_lib/constants';
import Icon, { ICONS } from './icon';
import Image from 'next/image';
import { getImageSettings, Coordinates, ImageSettings, VALID_FILE_TYPES, validateImage, HandleSettings, WholeHandleSettings, crop, UploadBadgeAction, BadgeUploadResponse } from '../_lib/components/upload';
import Button from './button';
import Modal from './modal';
import { useModalUpdate } from '../_lib/context/modalProvider';
import "../styles/components/userUpload.css";
import { runRequest } from '../_lib/api/global';
import ModalError from './modalError';
import { fromUploadResponse, MediaData } from '../_lib/api/media';

export default function Upload ({cropTitle, initialData, fieldName, isRequired=false, label, readonly=false, requireCrop = false, size=96, uploadType = "full"}: Readonly<{
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
    const [media, setMedia] = useState<MediaData | undefined>();
    const inputRef = useRef<HTMLInputElement> (null);
    const {showModal} = useModalUpdate();
    {/* Crop dialog */}
    const previewRef = useRef<HTMLImageElement> (null);
    const canvasRef = useRef<HTMLCanvasElement> (null);
    const containerRef = useRef<HTMLDivElement> (null);
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [preview, setPreview] = useState<ImageBitmap>();
    const [previewString, setPreviewString] = useState<string>();
    {/* Crop UI Logic */}
    const [imageSettings, setImageSettings] = useState<ImageSettings>();
    const EMPTY_HANDLE: HandleSettings = {coordinates: {x: 0, y:0}, active: false};
    const [topHandle, setTopHandle] = useState<HandleSettings>({...EMPTY_HANDLE});
    const [bottomHandle, setBottomHandle] = useState<HandleSettings>({...EMPTY_HANDLE, coordinates: {x: 100, y:100}});
    const [wholeHandle, setWholeHandle] = useState<WholeHandleSettings>({startingOffset: {x: 0, y: 0}, active: false});
    const [centerOffset, setCenterOffset] = useState<Coordinates>({x: 50, y:50});

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
                    onFileUpload (image);
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
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx == null) return;
        const [x, y, width, height] = [
            topHandle.coordinates.x,
            topHandle.coordinates.y, 
            bottomHandle.coordinates.x - topHandle.coordinates.x,
            bottomHandle.coordinates.y - topHandle.coordinates.y
        ];
        ctx.reset();
        ctx.fillStyle = "#000000aa";
        ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx.clearRect(x, y, width, height);
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.lineWidth = wholeHandle.active ? 5 : 2;
        ctx.strokeStyle = "white";
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.lineDashOffset = 5;
        ctx.strokeStyle = "black";
        ctx.stroke();
    }, [topHandle, bottomHandle, imageSettings]);

    useEffect(() => {
        if (isLoading || !preview) return;
        if (previewRef.current) {
            const observer = new ResizeObserver((entries) => {
                let settings = getImageSettings(preview, previewRef.current!);
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
    const onFileUpload = (image: ImageBitmap) => {
        if (!image) return;
        let cropPromise: Promise<Blob>;
        if (requireCrop) {
            if (!imageSettings) return;
            cropPromise = crop(image, topHandle.coordinates, bottomHandle.coordinates, imageSettings.resizeFactor);
        } else {
            cropPromise = crop(image, {x: 0, y: 0}, {x: image.width, y: image.height}, 1);
        }
        setPreview(undefined);
        image.close();
        
        cropPromise.then((imageBlob) => {
            const formData = new FormData();
            formData.append("image", imageBlob);
            setLoading(true);
            setError(false);
            runRequest(new UploadBadgeAction(), undefined, formData, undefined)
            .then((badge) => {
                setMedia(fromUploadResponse(badge as BadgeUploadResponse));
            }).catch((err)=>showModal(
                  tcommon("error"), 
                  <ModalError error={err} translationRoot="components" translationKey="upload.errors"/>
            )).finally(()=>setLoading(false));
        })
    };

    const onPreviewLoaded = () => {
        if (isLoading || !preview) return;
        setImageSettings(getImageSettings(preview, previewRef.current!));
        setTopHandle({...EMPTY_HANDLE});
        setBottomHandle({...EMPTY_HANDLE, coordinates: {x: 100, y: 100}});
    };

    const onMove = (e: PointerEvent<HTMLDivElement>) => {
        const coords = getCoordinates(e);
        const rect = previewRef.current!.getBoundingClientRect();
        const requireSquare = uploadType === 'profile';
        if (topHandle.active) {
            setTopHandle({
                ...topHandle, 
                coordinates: requireSquare ? calcAspectRatio(1, topHandle.coordinates, coords, rect, bottomHandle.coordinates) : coords
            });
        } else if (bottomHandle.active){
            setBottomHandle({
                ...bottomHandle,
                coordinates: requireSquare ? calcAspectRatio(1, bottomHandle.coordinates, coords, rect, topHandle.coordinates) : coords
            });
        } else if (wholeHandle.active) {
            // Get current coordinates
            const freeCoords = getCoordinates(e);
            // Get offset
            const offsetTop: Coordinates = {
                x: topHandle.coordinates.x - wholeHandle.startingOffset.x,
                y: topHandle.coordinates.y - wholeHandle.startingOffset.y,
            };
            const offsetBottom: Coordinates = {
                x: bottomHandle.coordinates.x - wholeHandle.startingOffset.x,
                y: bottomHandle.coordinates.y - wholeHandle.startingOffset.y,
            }

            const newTopCoordinates: Coordinates = {
                x: freeCoords.x + offsetTop.x,
                y: freeCoords.y + offsetTop.y
            };
            const newBottomCoordinates: Coordinates = {
                x: freeCoords.x + offsetBottom.x,
                y: freeCoords.y + offsetBottom.y
            };

            const adjustTopCoordinates: Coordinates = { 
                x: Math.min(Math.max(newTopCoordinates.x, 0), rect.width) - newTopCoordinates.x,
                y: Math.min(Math.max(newTopCoordinates.y, 0), rect.height) - newTopCoordinates.y,
            }

            const adjustBottomCoordinates: Coordinates = { 
                x: Math.min(Math.max(newBottomCoordinates.x, 0), rect.width) - newBottomCoordinates.x,
                y: Math.min(Math.max(newBottomCoordinates.y, 0), rect.height) - newBottomCoordinates.y,
            }

            newTopCoordinates.x += adjustBottomCoordinates.x + adjustTopCoordinates.x;
            newBottomCoordinates.x += adjustBottomCoordinates.x + adjustTopCoordinates.x;
            newTopCoordinates.y += adjustBottomCoordinates.y + adjustTopCoordinates.y;
            newBottomCoordinates.y += adjustBottomCoordinates.y + adjustTopCoordinates.y;


            const newStartingOffset: Coordinates = {
                x: freeCoords.x,
                y: freeCoords.y
            }

            setTopHandle({...topHandle, coordinates: newTopCoordinates});
            setBottomHandle({...bottomHandle, coordinates: newBottomCoordinates});
            setWholeHandle({...wholeHandle, startingOffset: newStartingOffset});
        }
    }

    const calcAspectRatio = (aspectRatio: number, original: Coordinates, changed: Coordinates, rect: DOMRect, otherHandle: Coordinates): Coordinates => {
        const changedRect = getRect(changed, otherHandle);
        const changedX = changed.x - original.x;
        const changedY = changed.y - original.y;
        const isXHigher = Math.abs(changedX) > Math.abs(changedY);
        let calcW = isXHigher ? changedRect.width : Math.round(changedRect.height * aspectRatio);
        let calcH = !isXHigher ? changedRect.height : Math.round(changedRect.width / aspectRatio);
        //let coordinatesToReturn 
        return {
            x: isXHigher ? changed.x : changed.y * aspectRatio,
            y: isXHigher ? changed.x / aspectRatio : changed.y,
        }
    }

    const getRect = (a: Coordinates, b: Coordinates): DOMRect => {
        const width = Math.abs(a.x - b.x);
        const height = Math.abs(a.y - b.y);
        const top = Math.min(a.y, b.y);
        const left = Math.min(a.x, b.x);
        const right = left + width;
        const bottom = top + height;

        return {
            width: width,
            height: height,
            right: left + width,
            bottom: top + height,
            top: top,
            left: left,
            x: top,
            y: left,
            toJSON: () => null
        };
    }

    const isOutOfRect = (a: Coordinates, b1: Coordinates, b2: Coordinates) => {
        let lowerX = Math.min(b1.x, b2.x);
        let lowerY = Math.min(b1.y, b2.y);
        let higherX = Math.max(b1.x, b2.x);
        let higherY = Math.max(b1.y, b2.y);
        return a.x < lowerX || a.x > higherX || a.y < lowerY || a.y > higherY;
    }

    const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
        const coords = getCoordinates(e);
        if (!isOutOfRect(coords, topHandle.coordinates, bottomHandle.coordinates)) {
            setWholeHandle({...wholeHandle, active: true, startingOffset: coords});
        }
    }

    const onLeave = (e: PointerEvent<HTMLDivElement>) => {
        setTopHandle({...topHandle, active: false});
        setBottomHandle({...bottomHandle, active: false});
        setWholeHandle({...wholeHandle, active: false});
    }

    /**
     * When the user wants to delete the uploaded media
     */
    const onDeleteRequest = () => {
        
    }

    const getCoordinates = (e: PointerEvent): Coordinates => {
        const rect = previewRef.current!.getBoundingClientRect();
        return {
            x: Math.min(Math.max(e.clientX - rect.left, 0), rect.width),
            y: Math.min(Math.max(e.clientY - rect.top, 0), rect.height)
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
                <Image className="rounded-s upload-picture" src={media?.relativePath ?? EMPTY_PROFILE_PICTURE_SRC}
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
        <Modal style={{overflow: "hidden"}} open={cropDialogOpen} title={cropTitle ?? t("upload.crop")} onClose={()=> setCropDialogOpen(false)}>
            <div className="crop-container" ref={containerRef} onResize={()=>onPreviewLoaded()} onPointerMove={onMove} onPointerLeave={onLeave} onPointerDown={onPointerDown} onPointerUp={onLeave}>
                <div className="fill-all"></div>
                <Image width={256} height={256} alt="" src={previewString ?? EMPTY_PROFILE_PICTURE_SRC}
                    className={"crop-image"} style={{objectFit: "contain"}} ref={previewRef}
                    onLoad={()=>onPreviewLoaded()}>
                </Image>
                <canvas ref={canvasRef} className="crop-canvas" width={previewRef.current?.clientWidth}
                    height={previewRef.current?.clientHeight}>
                </canvas>
                <button className={`handle ${topHandle.active ? "active" : ""}`} style={{top: renderTopHandle.y, left: renderTopHandle.x}}
                    onPointerDown={(e)=>{setTopHandle({...topHandle, active: true}); e.stopPropagation();}}
                    onPointerUp={()=>setTopHandle({...topHandle, active: false})}
                    onClick={()=>setTopHandle({...topHandle, active: false})}></button>
                <button className={`handle ${bottomHandle.active ? "active" : ""}`} style={{top: renderBottomHandle.y, left: renderBottomHandle.x}}
                    onPointerDown={(e)=>{setBottomHandle({...bottomHandle, active: true}); e.stopPropagation();}}
                    onPointerUp={()=>setBottomHandle({...bottomHandle, active: false})}
                    onClick={()=>setBottomHandle({...bottomHandle, active: false})}></button>
            </div>
            <span>{imageSettings?.width} - {imageSettings?.height}. Resize factor: {imageSettings?.resizeFactor}</span>
            <div className="bottom-toolbar">
                <Button title={tcommon('cancel')} className="danger" onClick={()=>setCropDialogOpen(false)}
                    iconName={ICONS.CANCEL} disabled={readonly} busy={isLoading}>{tcommon('cancel')}</Button>
                <div className="spacer"></div>
                <Button title={t('upload.upload')} onClick={()=>onFileUpload(preview!)}
                    iconName={ICONS.CLOUD_UPLOAD} disabled={readonly} busy={isLoading}>{!media && t('upload.upload')}</Button>    
            </div>
        </Modal>    
    </>
}