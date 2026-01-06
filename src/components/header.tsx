"use client"
import { useLocale, useTranslations } from 'next-intl';
import Image from "next/image";
import Icon from './icon';
import { useRouter } from "next/navigation";
import UserDropDown from './userDropdown';
import { useUser } from '@/components/context/userProvider';
import { useEffect, useState } from 'react';
import "@/styles/components/header.css";
import { APP_LINKS, SHOW_APP_BANNER } from '@/lib/constants';
import Link from 'next/link';
import { isMobile, UA } from '@/lib/userAgent';
import { OSName } from 'ua-parser-js/enums';

enum DEVICE_TYPE {
    APPLE = "apple",
    ANDROID = "android",
    GENERIC = "generic"
}

const type = isMobile()
    ? UA.os.is(OSName.ANDROID)
        ? DEVICE_TYPE.ANDROID
        : UA.os.is(OSName.IOS)
            ? DEVICE_TYPE.APPLE
            : DEVICE_TYPE.GENERIC
    : DEVICE_TYPE.GENERIC;

export default function Header() {
    const t = useTranslations('common');
    const locale = useLocale();
    const { userDisplay, userLoading } = useUser();
    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [latestScroll, setLatestScroll] = useState<number>();
    const [newScroll, setNewScroll] = useState<number>();
    const language = locale.split('-')[0];
    const deviceTypeLower = type.toString().toLowerCase();
    const appBadgeSrc = `/images/app-badge/${deviceTypeLower}/${deviceTypeLower}_${language}.png`;

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
                    <Icon icon={hamburgerOpen ? "CLOSE" : "MENU"} />
                </a>
            </span>
            <div className={`header-link-container horizontal-list flex-vertical-center ${hamburgerOpen ? "expanded" : ""}`}>
                <Link href="/home" className="header-link medium">
                    <Icon style={{ fontSize: "24px" }} icon="HOME" />
                    <span className="title semibold">{t('header.home')}</span>
                </Link>
                <Link href={`/nosecount`} className="header-link medium">
                    <Icon style={{ fontSize: "24px" }} icon="GROUPS" />
                    <span className="title semibold">{t('header.nose_count')}</span>
                </Link>
                {/* <a className="header-link">
                    <Icon style={{fontSize: "24px"}} iconName="INFO"/>
                    <span className="title semibold">{t('header.information')}</span>
                </a> */}
                <div className="spacer"></div>
                {/* <a className="header-link">
                    <Icon style={{fontSize: "24px"}} iconName="BOOKMARK_STAR"/>
                    <span className="title semibold">{t('header.archive')}</span>
                </a> */}
                <UserDropDown userData={userDisplay?.display} loading={userLoading}></UserDropDown>
                {/* Phone app */}
                {[DEVICE_TYPE.ANDROID, DEVICE_TYPE.APPLE].includes(type) && SHOW_APP_BANNER && <>
                    <p className='horizontal-list gap-4mm flex-vertical-center' style={{ width: '100%' }}>
                        <span className="descriptive small color-subtitle">{t("header.app_badge")}</span>
                        <div className="spacer"></div>
                        <a target="_blank" href={APP_LINKS[deviceTypeLower] ?? ""}>
                            <Image className="app-badge" src={appBadgeSrc} width={120} height={40} alt={t("header.alt_app_badge")}></Image>
                        </a>
                    </p>
                </>}
            </div>
        </header>
    )
}