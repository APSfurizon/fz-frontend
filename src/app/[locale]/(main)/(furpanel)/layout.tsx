"use client"
import {useTranslations} from 'next-intl';
import Icon, { ICONS } from "@/app/_components/icon";
import ToolLink from "@/app/_components/toolLink";
import { APP_GIT_PROJECT, APP_GIT_PROJECT_RELEASE, APP_VERSION, BADGE_ENABLED, BOOKING_ENABLED, DEBUG_ENABLED, READ_CHANGELOG_STORAGE_NAME, ROOM_ENABLED, TOKEN_STORAGE_NAME, UPLOAD_ENABLED } from '@/app/_lib/constants';
import { useModalUpdate } from '@/app/_lib/context/modalProvider';
import Modal from '@/app/_components/modal';
import { MouseEvent, useEffect, useState } from 'react';
import "../../../styles/furpanel/layout.css";
import { useUser } from '@/app/_lib/context/userProvider';
import { hasPermission, Permissions } from '@/app/_lib/api/permission';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { shouldShowChangelog } from '@/app/_lib/utils';

export default function Layout({children}: Readonly<{children: React.ReactNode;}>) {
    const t = useTranslations('furpanel');
    const tcommon = useTranslations('common');
    const {isOpen, icon, title, modalChildren, hideModal, showModal} = useModalUpdate();
    const [toolListExpanded, setToolListExpanded] = useState(false);
    const params = useSearchParams();
    const path = usePathname();
    const router = useRouter();
    const {userDisplay, setUpdateUser} = useUser();

    useEffect(()=>{
        const token = params.get(TOKEN_STORAGE_NAME);
        if (token && token.length > 0){
            const newParams = new URLSearchParams(params);
            newParams.delete(TOKEN_STORAGE_NAME);
            router.replace(`${path}?${newParams.toString()}`);
            setUpdateUser(true);
            return;
        }
        if (shouldShowChangelog()) {
            localStorage.setItem(READ_CHANGELOG_STORAGE_NAME, APP_VERSION ?? "");
            showModal(tcommon("changelog.title"),
            <span>
                {tcommon.rich("changelog.description", {
                    a: (chunks) => <a target='_blank' href={APP_GIT_PROJECT_RELEASE.toString()}>{APP_GIT_PROJECT_RELEASE.toString()}</a>
                })}
            </span>,
            ICONS.FEATURED_SEASONAL_AND_GIFTS);
        }
    }, [])

    const toolClick = (e: MouseEvent<HTMLAnchorElement>) => {
        setToolListExpanded(false);
    }

    return <>
        <div className="main-dialog rounded-s">
            <div className="horizontal-list gap-4mm">
                <span>
                    <span className="title-pair">
                        <Icon iconName="design_services"></Icon>
                        <span className="titular bold highlight">furpanel</span>
                    </span>
                </span>
                <div className="spacer"></div>
                <div className={`tools-list horizontal-list flex-wrap gap-4mm ${toolListExpanded ? "expanded" : ""}`}>
                    {BOOKING_ENABLED && <ToolLink onClick={toolClick} href="/booking" iconName={ICONS.LOCAL_ACTIVITY}>{t('booking.title')}</ToolLink>}
                    {BADGE_ENABLED && <ToolLink onClick={toolClick} href="/badge" iconName={ICONS.PERSON_BOOK}>{t('badge.title')}</ToolLink>}
                    {ROOM_ENABLED && <ToolLink onClick={toolClick} href="/room" iconName={ICONS.BED}>{t('room.title')}</ToolLink>}
                    {UPLOAD_ENABLED && <ToolLink onClick={toolClick} href="/upload-area" iconName={ICONS.PHOTO_CAMERA}>{t('upload_area.title')}</ToolLink>}
                    <ToolLink onClick={toolClick} href="/user" iconName={ICONS.PERSON}>{t('user.title')}</ToolLink>
                    {hasPermission(Permissions.CAN_SEE_ADMIN_PAGES, userDisplay) && <ToolLink onClick={toolClick} href="/admin" iconName={ICONS.SECURITY}>{t('admin.title')}</ToolLink>}
                    {DEBUG_ENABLED && <ToolLink href="/debug" iconName={ICONS.BUG_REPORT}>{t('debug.title')}</ToolLink>}
                </div>
                <span>
                    <a href="#" className="hamburger rounded-l" onClick={()=>setToolListExpanded(!toolListExpanded)}>
                        <Icon iconName={toolListExpanded ? ICONS.CLOSE : ICONS.MENU}></Icon>
                    </a>
                </span>
            </div>
            
            {children}
        </div>
        <Modal icon={icon} title={title} open={isOpen} onClose={hideModal} zIndex={600}>{modalChildren}</Modal>
    </>;
  }