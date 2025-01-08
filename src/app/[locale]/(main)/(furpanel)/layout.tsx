"use client"
import {useTranslations} from 'next-intl';
import Icon, { ICONS } from "@/app/_components/icon";
import ToolLink from "@/app/_components/toolLink";
import { BADGE_ENABLED, BOOKING_ENABLED, DEBUG_ENABLED, ROOM_ENABLED, UPLOAD_ENABLED } from '@/app/_lib/constants';
import { useModalUpdate } from '@/app/_lib/context/modalProvider';
import Modal from '@/app/_components/modal';
import { MouseEvent, useState } from 'react';
import "../../../styles/furpanel/layout.css";

export default function Layout({children}: Readonly<{children: React.ReactNode;}>) {
    const t = useTranslations('furpanel');
    const {isOpen, icon, title, modalChildren, hideModal} = useModalUpdate();
    const [toolListExpanded, setToolListExpanded] = useState(false);

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
                    {<ToolLink onClick={toolClick} href="/admin" iconName={ICONS.SECURITY}>{t('admin.title')}</ToolLink>}
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
        <Modal icon={icon} title={title} open={isOpen} onClose={hideModal}>{modalChildren}</Modal>
    </>;
  }