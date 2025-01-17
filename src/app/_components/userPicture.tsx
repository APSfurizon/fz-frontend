"use client"
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { EMPTY_PROFILE_PICTURE_SRC } from '../_lib/constants';
import { getFlagEmoji } from '../_lib/components/userPicture';
import Icon, { ICONS } from './icon';
import Image from 'next/image';
import "../styles/components/userPicture.css";
import { UserData } from '../_lib/api/user';
import { getImageUrl } from '../_lib/utils';

export default function UserPicture ({size, userData, showNickname, showFlag, hideEffect=false }: Readonly<{size?: number, userData: UserData | Promise<UserData>, showNickname?: boolean, showFlag?: boolean, hideEffect?: boolean}>) { 
    const t = useTranslations('common');
    const [isLoading, setLoading] = useState(true);
    const [pictureData, setPictureData] = useState<UserData>();
    useEffect(()=>{
        if (userData instanceof Promise) {
            setLoading(true);
            userData.then(ud => {
                setLoading(false);
                setPictureData(ud);
            });
        } else {
            setLoading(false);
            setPictureData(userData);
        }
    });
    
    return (
        <div className="user-picture-container vertical-list flex-vertical-center">
            <div className={`image-container rounded-m sponsor-${pictureData?.sponsorship ?? "NONE"} ${hideEffect ? "no-effect" : ""}`}>
                <Image className="rounded-s profile-picture" src={getImageUrl(pictureData?.propicUrl) ?? EMPTY_PROFILE_PICTURE_SRC} alt={t('header.alt_profile_picture')} width={size ?? 32} height={size ?? 32}></Image>
            </div>
            { showNickname && (
                <span className="title semibold nickname small">
                    {isLoading && <Icon className='loading-animation small' style={{marginRight: '0.3125em'}} iconName={ICONS.PROGRESS_ACTIVITY}></Icon>}
                    {isLoading ? t('loading') : pictureData?.fursonaName ?? 'unknown'}
                    {pictureData?.locale && showFlag && <span className="flag">{getFlagEmoji(pictureData?.locale?.toLowerCase() ?? "it")}</span>}
                </span>
            )}
        </div>
    )
}