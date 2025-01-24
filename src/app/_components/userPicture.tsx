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
import { FursuitDetails } from '../_lib/api/badge/fursuits';

export default function UserPicture ({size, userData, fursuitData, showNickname, showFlag, hideEffect=false }: Readonly<{size?: number, userData?: UserData | Promise<UserData>, fursuitData?: FursuitDetails | Promise<FursuitDetails>, showNickname?: boolean, showFlag?: boolean, hideEffect?: boolean}>) { 
    const t = useTranslations('common');
    const [isLoading, setLoading] = useState(true);
    const [pictureData, setPictureData] = useState<UserData>();
    const [fursuitPictureData, setFursuitPictureData] = useState<FursuitDetails>();
    if (!userData && !fursuitData) throw new Error("User picture without both fursuit and user data");

    useEffect(()=>{
        if (userData) {
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
        } else if (fursuitData) {
            if (fursuitData instanceof Promise) {
                setLoading(true);
                fursuitData.then(fd => {
                    setLoading(false);
                    setFursuitPictureData(fd);
                });
            } else {
                setLoading(false);
                setFursuitPictureData(fursuitData);
            }
        }
    }, []);
    
    return (
        <div className="user-picture-container vertical-list flex-vertical-center">
            <div className={`image-container rounded-m sponsor-${pictureData?.sponsorship ?? fursuitPictureData?.sponsorship ?? "NONE"} ${hideEffect ? "no-effect" : ""}`}>
                <Image unoptimized className="rounded-s profile-picture"
                    src={getImageUrl(pictureData?.propic?.mediaUrl) ?? getImageUrl(fursuitPictureData?.propic?.mediaUrl) ?? EMPTY_PROFILE_PICTURE_SRC}
                    alt={t('header.alt_profile_picture')} quality={100} width={size ?? 32} height={size ?? 32}>
                </Image>
            </div>
            { showNickname && (
                <span className="title semibold nickname small">
                    {isLoading && <Icon className='loading-animation small' style={{marginRight: '0.3125em'}} iconName={ICONS.PROGRESS_ACTIVITY}></Icon>}
                    {isLoading ? t('loading') : pictureData?.fursonaName ?? fursuitPictureData?.name ?? 'unknown'}
                    {pictureData?.locale && showFlag && <span className="flag">{getFlagEmoji(pictureData?.locale?.toLowerCase() ?? "it")}</span>}
                </span>
            )}
        </div>
    )
}