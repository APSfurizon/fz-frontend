"use client"
import {useLocale, useTranslations} from 'next-intl';
import Image from "next/image";
import Icon, { ICONS } from './icon';
import { useRouter } from 'next/navigation';
import Button from "../_components/button";
import UserDropDown from './userDropdown';
import { useUser } from '../_lib/context/userProvider';
import { ReactEventHandler, useEffect, useState } from 'react';
import "../styles/components/header.css";
import { DEVICE_TYPE, getDeviceType } from '../_lib/utils';
import { APP_LINKS } from '../_lib/constants';

export default function Header () {
    const t = useTranslations('common');
    const locale = useLocale();
    const {userData, userLoading} = useUser();
    const router = useRouter();
    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [latestScroll, setLatestScroll] = useState<number>();
    const [newScroll, setNewScroll] = useState<number>();
    const type = getDeviceType();

    useEffect(()=>document.body.addEventListener('scroll', 
        (e: Event)=>setNewScroll(document.body.scrollTop)), []);

    useEffect(()=>{
        if (newScroll === undefined) return;
        if (latestScroll === undefined){
            setLatestScroll(newScroll);
            return;
        }

        /*Scrolled down*/
        if (newScroll > latestScroll) {
            setCollapsed(true);
        } else {
            setCollapsed(false);
        }
        setLatestScroll(newScroll);
    }, [newScroll])

    return (
        <header className={`header ${collapsed ? "collapsed" : ""}`}>
            <div className="logo-container center">
                <Image className="header-logo" src="/images/logo-dark.png" alt={t('header.alt_logo')} width={175} height={40}></Image>
            </div>
            <span>
                <a href="#" className="hamburger rounded-l" onClick={()=>setHamburgerOpen(!hamburgerOpen)}>
                    <Icon iconName={hamburgerOpen ? ICONS.CLOSE : ICONS.MENU}></Icon>
                </a>
            </span>
            <div className={`header-link-container horizontal-list flex-vertical-center ${hamburgerOpen ? "expanded" : ""}`}>
                <a className="header-link">
                    <Icon style={{fontSize: "24px"}} iconName={ICONS.HOME}></Icon>
                    <span className="title semibold">{t('header.home')}</span>
                </a>
                <a className="header-link">
                    <Icon style={{fontSize: "24px"}} iconName={ICONS.GROUPS}></Icon>
                    <span className="title semibold">{t('header.nose_count')}</span>
                </a>
                {/* <a className="header-link">
                    <Icon style={{fontSize: "24px"}} iconName={ICONS.INFO}></Icon>
                    <span className="title semibold">{t('header.information')}</span>
                </a> */}
                <div className="spacer"></div>
                {/* <a className="header-link">
                    <Icon style={{fontSize: "24px"}} iconName={ICONS.BOOKMARK_STAR}></Icon>
                    <span className="title semibold">{t('header.archive')}</span>
                </a> */}
                {
                    userLoading 
                        ? <Button busy={userLoading}>{t('loading')}</Button>
                        : userData 
                            ? <UserDropDown userData={userData}></UserDropDown>
                            : <Button onClick={()=>router.push('/login')} iconName='key'>{t('header.login')}</Button>
                }

                {/* Phone app */}
                { [DEVICE_TYPE.ANDROID, DEVICE_TYPE.APPLE].includes(type) && <>
                    <p className='horizontal-list gap-4mm flex-vertical-center' style={{width: '100%'}}>
                        <span className="descriptive small color-subtitle">{t("header.app-badge")}</span>
                        <div className="spacer"></div>
                        <a target="_blank" href={APP_LINKS[type.toString().toLowerCase()] ?? ""}>
                            <Image className="app-badge" src={`/images/app-badge/${type.toString().toLowerCase()}/${type.toString().toLowerCase()}_${locale}.png`} width={120} height={40} alt=""></Image>
                        </a>
                    </p>
                </>}
            </div>
        </header>
    )
}