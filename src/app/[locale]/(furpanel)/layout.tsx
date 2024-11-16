"use client"
import {useTranslations} from 'next-intl';
import Icon, { ICONS } from "@/app/_components/icon";
import ToolLink from "@/app/_components/toolLink";
import useAuth from '@/app/_lib/api/hooks/useAuth';

export default function Layout({children}: Readonly<{children: React.ReactNode;}>) {
    const t = useTranslations('furpanel');
    useAuth();
    return (
        <div className="main-dialog rounded-s">
            <div className="horizontal-list gap-4mm">
                <span className="title-pair">
                    <Icon iconName="design_services"></Icon>
                    <span className="titular bold highlight">furpanel</span>
                </span>
                <div className="tools-list horizontal-list gap-4mm">
                    <ToolLink href="badge" iconName={ICONS.PERSON_BOOK}>{t('badge.title')}</ToolLink>
                    <ToolLink href="room" iconName={ICONS.BED}>{t('room.title')}</ToolLink>
                    <ToolLink href="upload-area" iconName={ICONS.PHOTO_CAMERA}>{t('upload_area.title')}</ToolLink>
                    <ToolLink href="user" iconName={ICONS.PERSON}>{t('user.title')}</ToolLink>
                    <ToolLink href="debug" iconName={ICONS.BUG_REPORT}>{t('debug.title')}</ToolLink>
                </div>
            </div>
            
            {children}
        </div>
    );
  }