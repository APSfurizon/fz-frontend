"use client"
import {useLocale, useTranslations} from 'next-intl';
import {routing, usePathname, useRouter} from '@/i18n/routing';
import { MouseEvent, useState } from 'react';
import Icon, { ICONS } from '@/components/icon';
import UserPicture from '@/components/userPicture';
import { runRequest } from '@/lib/api/global';
import { LogoutApiAction } from '@/lib/api/authentication/login';
import { UserData } from '@/lib/api/user';
import { useParams } from 'next/navigation';
import Button from '@/components/button';
import LoadingPanel from './loadingPanel';
import "@/styles/components/userDropDown.css";

export default function UserDropDown ({userData, loading}: Readonly<{userData?: UserData, loading: boolean}>) { 
    const [isOpen, setOpen] = useState(false);
    const [isHover, setHover] = useState(false);
    const t = useTranslations('common');
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const locale = useLocale();
    
    
    const logout = () => {
        runRequest(new LogoutApiAction())
        .catch((err)=>console.warn("Could not log out: "+ err))
        .finally(()=>router.replace("/logout"));
    }

    const optionClick = (e: MouseEvent<HTMLDivElement>) => {
        setOpen(!isOpen);
        e.stopPropagation();
    }

    const onLanguageClick = (newLanguage: string) => {
        router.refresh();
        router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        {pathname, params}, {locale: newLanguage});
        router.refresh();
    }

    const loginClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation ();
        router.push('/login');
    }

    return (
        <div className="user-dropdown rounded-m">
            <div tabIndex={0} className="dropdown-button horizontal-list flex-vertical-center gap-2mm rounded-m" 
                onClick={()=>setOpen(!isOpen)} onBlur={()=>{if (!isHover) setOpen(false)}}
                onPointerOver={()=>setHover(true)} onPointerLeave={()=>setHover(false)}>
                {loading && <LoadingPanel/>}
                {!userData && !loading && <Button onClick={loginClick} iconName={ICONS.KEY}>
                    {t('header.login')}
                </Button>}
                {userData && <>
                    <UserPicture userData={userData}></UserPicture>
                    <span className="title average semibold nickname">{userData.fursonaName}</span>
                </>}
                <Icon style={{fontSize: "24px"}} iconName={(isOpen) ? ICONS.ARROW_DROP_UP : ICONS.ARROW_DROP_DOWN}></Icon>
            </div>
            <div className={`vertical-list dropdown-container rounded-m ${(isOpen) && 'open'}`} onClick={optionClick}
                onPointerOver={()=>setHover(true)} onPointerLeave={()=>setHover(false)}>
                {/* Logout */}
                {userData && <a href='#' onClick={() => logout()} className='title small rounded-s vertical-align-middle'>
                    {t('header.dropdown.logout')}
                </a>}
                {/* Login */}
                {!userData && !loading && <a href='/login' className='title small rounded-s vertical-align-middle'>
                    {t('header.login')}
                </a>}
                {/* Language selector */}
                <hr/>
                {routing.locales.map((lng, index)=> <a href='#' className='title small rounded-s vertical-align-middle horizontal-list' key={index}
                    onClick={() => onLanguageClick (lng)}>
                    {t(`header.dropdown.language.${lng}`)}
                    {lng === locale && <Icon className='medium' iconName={ICONS.CHECK}></Icon>}
                </a>)}
            </div>
        </div>
    )
}