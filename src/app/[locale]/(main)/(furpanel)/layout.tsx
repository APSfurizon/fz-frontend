"use client"
import {useTranslations} from 'next-intl';
import Icon, { ICONS } from "@/app/_components/icon";
import ToolLink from "@/app/_components/toolLink";
import { DEBUG_ENABLED } from '@/app/_lib/constants';
import "../../../styles/furpanel/layout.css";
import { useModalUpdate } from '@/app/_lib/context/modalProvider';
import Modal from '@/app/_components/modal';

export default function Layout({children}: Readonly<{children: React.ReactNode;}>) {
    const t = useTranslations('furpanel');
    const {isOpen, title, modalChildren, showModal, hideModal} = useModalUpdate();
    return <>
        <div className="main-dialog rounded-s">
            <div className="horizontal-list gap-4mm">
                <span className="title-pair">
                    <Icon iconName="design_services"></Icon>
                    <span className="titular bold highlight">furpanel</span>
                </span>
                <div className="tools-list horizontal-list gap-4mm">
                    <div style={{flex: "1"}}></div>
                    <ToolLink href="badge" iconName={ICONS.PERSON_BOOK}>{t('badge.title')}</ToolLink>
                    <ToolLink href="room" iconName={ICONS.BED}>{t('room.title')}</ToolLink>
                    <ToolLink href="upload-area" iconName={ICONS.PHOTO_CAMERA}>{t('upload_area.title')}</ToolLink>
                    <ToolLink href="user" iconName={ICONS.PERSON}>{t('user.title')}</ToolLink>
                    {DEBUG_ENABLED && <ToolLink href="debug" iconName={ICONS.BUG_REPORT}>{t('debug.title')}</ToolLink>}
                </div>
            </div>
            
            {children}
        </div>
        <Modal title={title} open={isOpen} onClose={hideModal}>{modalChildren}</Modal>
    </>;
  }