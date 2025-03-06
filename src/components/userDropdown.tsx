"use client"
import {useLocale, useTranslations} from 'next-intl';
import {routing, usePathname, useRouter} from '@/i18n/routing';
import { MouseEvent, startTransition, useEffect, useState } from 'react';
import Icon, { ICONS } from '@/components/icon';
import UserPicture from '@/components/userPicture';
import { runRequest } from '@/lib/api/global';
import { LogoutApiAction } from '@/lib/api/authentication/login';
import { UserData } from '@/lib/api/user';
import { useParams } from 'next/navigation';
import "@/styles/components/userDropDown.css";
import Button from '@/components/button';

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
        <span tabIndex={0} className="user-dropdown horizontal-list flex-vertical-center rounded-m" 
            onClick={()=>setOpen(!isOpen)} onBlur={()=>{if (!isHover) setOpen(false)}}
            onPointerOver={()=>setHover(true)} onPointerLeave={()=>setHover(false)}>
                <Icon style={{fontSize: "24px"}} iconName={isOpen ? ICONS.ARROW_DROP_UP : ICONS.ARROW_DROP_DOWN}></Icon>
                {loading && <span>
                    <Icon iconName={ICONS.PROGRESS_ACTIVITY} className="loading-animation"></Icon>
                    {t("loading")}
                </span>}
                {!userData && !loading && <Button onClick={loginClick}
                    iconName={ICONS.KEY}>
                    {t('header.login')}
                </Button>}
                {userData && <>
                    <span className="title semibold nickname">{userData.fursonaName}</span>
                    <UserPicture userData={userData}></UserPicture>
                </>}
                <div className={`dropdown-container vertical-list rounded-m ${isOpen && 'open'}`} onClick={optionClick}>
                    {/* Logout */}
                    {userData && <a href='#' onClick={() => logout()} className='title rounded-s vertical-align-middle'>
                        {t('header.dropdown.logout')}
                    </a>}
                    {/* Logout */}
                    {!userData && !loading && <a href='/login' className='title rounded-s vertical-align-middle'>
                        {t('header.login')}
                    </a>}
                    {/* Language selector */}
                    <hr/>
                    {routing.locales.map((lng, index)=> <a href='#' className='title rounded-s vertical-align-middle horizontal-list' key={index}
                        onClick={() => onLanguageClick (lng)}>
                        {t(`header.dropdown.language.${lng}`)}
                        {lng === locale && <Icon className='medium' iconName={ICONS.CHECK}></Icon>}
                    </a>)}
                </div>
        </span>
    )
}