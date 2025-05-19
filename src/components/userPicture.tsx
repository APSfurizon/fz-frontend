"use client"
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { EMPTY_PROFILE_PICTURE_SRC } from '@/lib/constants';
import { getFlagEmoji } from '@/lib/components/userPicture';
import Image from 'next/image';
import "@/styles/components/userPicture.css";
import { ExtraDays, UserData } from '@/lib/api/user';
import { getImageUrl } from '@/lib/utils';
import { FursuitDetails } from '@/lib/api/badge/fursuits';
import LoadingPanel from './loadingPanel';
import StatusBox from './statusBox';

export default function UserPicture ({
    size,
    userData,
    fursuitData,
    extraDays = ExtraDays.NONE,
    showNickname,
    showFlag,
    hideEffect = false
}: Readonly<{
    size?: number,
    userData?: UserData | Promise<UserData>,
    fursuitData?: FursuitDetails | Promise<FursuitDetails>,
    extraDays?: ExtraDays,
    showNickname?: boolean,
    showFlag?: boolean,
    hideEffect?: boolean
}>) { 
    const t = useTranslations();
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
    
    const borderClassName = useMemo(()=>
        `image-container rounded-m sponsor-${pictureData?.sponsorship ?? fursuitPictureData?.sponsorship ?? "NONE"} ${hideEffect ? "no-effect" : ""}`,
        [pictureData, fursuitData, isLoading]);

    return (
        <div className="user-picture-container vertical-list flex-vertical-center">
            <div className={borderClassName}>
                <Image unoptimized className="rounded-s profile-picture"
                    src={getImageUrl(pictureData?.propic?.mediaUrl) ?? getImageUrl(fursuitPictureData?.propic?.mediaUrl) ?? EMPTY_PROFILE_PICTURE_SRC}
                    alt={t('common.header.alt_profile_picture')} quality={100} width={size ?? 32} height={size ?? 32}>
                </Image>
            </div>
            { showNickname && (
                <span className="title semibold nickname small" style={{maxWidth: size}}>
                    {isLoading && <LoadingPanel/>}
                    {pictureData?.fursonaName ?? fursuitPictureData?.name ?? ''}
                    {pictureData?.locale && showFlag && <span className="flag">
                        {getFlagEmoji(pictureData?.locale.toLowerCase())}
                    </span>}
                </span>
            )}
            { extraDays != ExtraDays.NONE && <div className="vertical-list gap-2mm">
                {[ExtraDays.EARLY, ExtraDays.BOTH].includes(extraDays) && <StatusBox>
                    {t(`furpanel.booking.items.extra_days_${ExtraDays.EARLY}`)}
                    </StatusBox>}
                {[ExtraDays.LATE, ExtraDays.BOTH].includes(extraDays) && <StatusBox>
                    {t(`furpanel.booking.items.extra_days_${ExtraDays.LATE}`)}
                    </StatusBox>}
            </div>}
        </div>
    )
}