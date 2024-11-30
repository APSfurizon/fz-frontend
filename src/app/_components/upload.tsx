"use client"
import { useTranslations } from 'next-intl';
import { EMPTY_USER_PICTURE, UserPictureData } from '../_lib/api/user';
import { ChangeEvent, ChangeEventHandler, MouseEvent, useEffect, useRef, useState } from 'react';
import { EMPTY_PROFILE_PICTURE_SRC } from '../_lib/constants';
import Icon, { ICONS } from './icon';
import Image from 'next/image';
import { Media, UploadPhase } from '../_lib/components/upload';
import Button from './button';
import Modal from './modal';
import UploadDialog from '../_dialogues/uploadDialog';
import "../styles/components/userUpload.css";

export default function Upload ({initialData, directUpload = false, fieldName, isRequired=false, readonly=false, size=96, uploadType = "profile"}: Readonly<{
    initialData?: number,
    directUpload?: boolean,
    fieldName?: string,
    isRequired?: boolean,
    readonly?: boolean,
    size?: number,
    uploadType?: "full" | "profile"
}>) { 
    const t = useTranslations('components');
    const [isLoading, setLoading] = useState(true);
    const [media, setMedia] = useState<Media | undefined>();
    const inputRef = useRef<HTMLInputElement> (null);
    /* Upload dialog states */
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    useEffect(()=> {
        if (initialData) {

        }
    }, [initialData]);

    const onPreview = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files && e.currentTarget.files.length == 1) {
            //setPhase(UploadPhase.PREVIEW);
            //setPreviewUrl(URL.createObjectURL(inputRef.current!.files![0]))
        } else {
            //setPhase(UploadPhase.EMPTY);
        }
    }
    
    const imageSrc = media?.path ?? EMPTY_PROFILE_PICTURE_SRC;

    return <>
        <input tabIndex={-1} className="suppressed-input" type="text" name={fieldName} value={media?.id} required={isRequired}></input>
        <div className="upload-container vertical-list flex-vertical-center rounded-l gap-2mm">
            <div className={`image-container rounded-s`}>
                <Image className="rounded-s upload-picture" src={imageSrc}
                    alt={t('upload.alt_preview_image')} width={size} height={size}
                    style={{aspectRatio: "1", maxWidth: size, maxHeight: size, objectFit: "contain"}}>
                </Image>
            </div>
            <div className="tools-container">
                <Button onClick={()=>setUploadDialogOpen(true)} iconName={directUpload ? ICONS.CLOUD_UPLOAD : ICONS.FILE_OPEN} disabled={readonly}>{t('upload.open')}</Button>
            </div>
        </div>
        {/* Upload dialog */}
        <Modal zIndex={401} open={uploadDialogOpen} onClose={()=>setUploadDialogOpen(false)} title={t("upload.select_image")}>
            <UploadDialog zIndex={401} >

            </UploadDialog>
        </Modal>
        {/* Form data */}
        <form className="suppressed-input">
            <input type="hidden" value={uploadType}></input>
            <input type="file" ref={inputRef} onChange={onPreview}></input>
        </form>
    </>
}