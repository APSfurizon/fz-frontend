"use client"
import { useLocale, useTranslations } from 'next-intl';
import Image from "next/image";
import Icon, { ICONS } from './icon';
import { useRouter } from 'next/navigation';
import UserDropDown from './userDropdown';
import { useUser } from '@/components/context/userProvider';
import { useEffect, useState } from 'react';
import "@/styles/components/header.css";
import { DEVICE_TYPE, getDeviceType } from '@/lib/utils';
import { APP_LINKS, SHOW_APP_BANNER } from '@/lib/constants';
import Link from 'next/link';

export default function Header() {
    const t = useTranslations('common');
    const locale = useLocale();
    const { userDisplay, userLoading } = useUser();
    const router = useRouter();
    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [latestScroll, setLatestScroll] = useState<number>();
    const [newScroll, setNewScroll] = useState<number>();
    const type = getDeviceType();

    useEffect(() => document.body.addEventListener('scroll',
        (e: Event) => setNewScroll(document.body.scrollTop)), []);

    useEffect(() => {
        if (newScroll === undefined) return;
        if (latestScroll === undefined) {
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
                <picture className="header-logo">
                    <source srcSet="/images/logo-dark.png" media="(prefers-color-scheme: dark)" />
                    <Image className="header-logo" src="/images/logo-light.png" alt={t('header.alt_logo')} width={175} height={40}></Image>
                </picture>
            </div>
            <span>
                <a href="#" className="hamburger rounded-l" onClick={() => setHamburgerOpen(!hamburgerOpen)}>
                    <Icon icon={hamburgerOpen ? ICONS.CLOSE : ICONS.MENU}></Icon>
                </a>
            </span>
            <div className={`header-link-container horizontal-list flex-vertical-center ${hamburgerOpen ? "expanded" : ""}`}>
                <Link href="/home" className="header-link medium">
                    <Icon style={{ fontSize: "24px" }} icon={ICONS.HOME}></Icon>
                    <span className="title semibold">{t('header.home')}</span>
                </Link>
                <Link href={`/nosecount`} className="header-link medium">
                    <Icon style={{ fontSize: "24px" }} icon={ICONS.GROUPS}></Icon>
                    <span className="title semibold">{t('header.nose_count')}</span>
                </Link>
                {/* <a className="header-link">
                    <Icon style={{fontSize: "24px"}} iconName={ICONS.INFO}></Icon>
                    <span className="title semibold">{t('header.information')}</span>
                </a> */}
                <div className="spacer"></div>
                {/* <a className="header-link">
                    <Icon style={{fontSize: "24px"}} iconName={ICONS.BOOKMARK_STAR}></Icon>
                    <span className="title semibold">{t('header.archive')}</span>
                </a> */}
                <UserDropDown userData={userDisplay?.display} loading={userLoading}></UserDropDown>
                {/* Phone app */}
                {[DEVICE_TYPE.ANDROID, DEVICE_TYPE.APPLE].includes(type) && SHOW_APP_BANNER && <>
                    <p className='horizontal-list gap-4mm flex-vertical-center' style={{ width: '100%' }}>
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