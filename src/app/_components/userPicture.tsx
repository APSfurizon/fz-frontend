"use client"
import { useTranslations } from 'next-intl';
import { EMPTY_USER_PICTURE, UserPictureData } from '../_lib/api/user';
import { useEffect, useState } from 'react';
import { EMPTY_PROFILE_PICTURE_SRC } from '../_lib/constants';
import { getFlagEmoji } from '../_lib/components/userPicture';
import Icon, { ICONS } from './icon';
import Image from 'next/image';
import "../styles/components/userPicture.css";

export default function UserPicture ({size, userData, showNickname, showFlag }: Readonly<{size?: number, userData: UserPictureData | Promise<UserPictureData>, showNickname?: boolean, showFlag?: boolean}>) { 
    const t = useTranslations('common');
    const [isLoading, setLoading] = useState(true);
    const [pictureData, setPictureData] = useState<UserPictureData>(EMPTY_USER_PICTURE);
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
            <div className={`image-container rounded-m sponsor-${pictureData.sponsorType}`}>
                <Image className="rounded-s profile-picture" src={pictureData.profile_picture_url ?? EMPTY_PROFILE_PICTURE_SRC} alt={t('header.alt_profile_picture')} width={size ?? 32} height={size ?? 32}></Image>
            </div>
            { showNickname && (
                <span className="title semibold nickname small">
                    {isLoading && <Icon className='loading-animation small' style={{marginRight: '0.3125em'}} iconName={ICONS.PROGRESS_ACTIVITY}></Icon>}
                    {isLoading ? t('loading') : pictureData.nickname ?? 'unknown'}
                    {pictureData.country && showFlag && <span className="flag">{getFlagEmoji(pictureData.country)}</span>}
                </span>
            )}
        </div>
    )
}