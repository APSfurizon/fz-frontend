"use client"
import { useTranslations } from 'next-intl';
import Icon from "@/components/icon";
import ToolLink from "@/components/toolLink";
import {
    APP_GIT_PROJECT_RELEASE, APP_VERSION, BADGE_ENABLED, BOOKING_ENABLED, DEBUG_ENABLED, ROOM_ENABLED,
    TOKEN_STORAGE_NAME, UPLOAD_ENABLED, READ_CHANGELOG_STORAGE_NAME
} from '@/lib/constants';
import { useModalUpdate } from '@/components/context/modalProvider';
import Modal from '@/components/modal';
import { useEffect, useState } from 'react';
import "@/styles/furpanel/layout.css";
import { useUser } from '@/components/context/userProvider';
import { hasPermission, Permissions } from '@/lib/api/permission';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { shouldShowChangelog } from '@/lib/utils';

export default function Layout({ children }: Readonly<{ children: React.ReactNode; }>) {
    const t = useTranslations();
    const { isOpen, icon, title, modalChildren, hideModal, showModal } = useModalUpdate();
    const [toolListExpanded, setToolListExpanded] = useState(false);
    const params = useSearchParams();
    const path = usePathname();
    const router = useRouter();
    const { userDisplay, setUpdateUser } = useUser();

    useEffect(() => {
        const token = params.get(TOKEN_STORAGE_NAME);
        if (token && token.length > 0) {
            const newParams = new URLSearchParams(params);
            newParams.delete(TOKEN_STORAGE_NAME);
            router.replace(`${path}?${newParams.toString()}`);
            setUpdateUser(true);
            return;
        }
        if (shouldShowChangelog()) {
            localStorage.setItem(READ_CHANGELOG_STORAGE_NAME, APP_VERSION ?? "");
            showModal(t("common.changelog.title"),
                <span>
                    {t.rich("common.changelog.description", {
                        a: () => <a target='_blank' href={APP_GIT_PROJECT_RELEASE.toString()}>
                            {APP_GIT_PROJECT_RELEASE.toString()}
                        </a>
                    })}
                </span>,
                "FEATURED_SEASONAL_AND_GIFTS");
        }
    }, [])

    const toolClick = () => {
        setToolListExpanded(false);
    }

    return <>
        <div className="main-dialog rounded-s">
            <div className="horizontal-list gap-4mm">
                <span>
                    <span className="title-pair">
                        <Icon icon="DESIGN_SERVICES"></Icon>
                        <span className="titular bold highlight">furpanel</span>
                    </span>
                </span>
                <div className="spacer"></div>
                <div className={`tools-list horizontal-list flex-wrap gap-4mm ${toolListExpanded ? "expanded" : ""}`}
                    style={{ justifyContent: 'flex-end' }}>
                    {BOOKING_ENABLED && <ToolLink onClick={toolClick}
                        href="/booking"
                        iconName={"LOCAL_ACTIVITY"}>
                        {t('furpanel.booking.title')}
                    </ToolLink>}
                    {BADGE_ENABLED && <ToolLink onClick={toolClick}
                        href="/badge"
                        iconName={"PERSON_BOOK"}>
                        {t('furpanel.badge.title')}
                    </ToolLink>}
                    {ROOM_ENABLED && <ToolLink onClick={toolClick}
                        href="/room"
                        iconName={"BED"}>
                        {t('furpanel.room.title')}
                    </ToolLink>}
                    {UPLOAD_ENABLED && <ToolLink onClick={toolClick}
                        href="/upload-area"
                        iconName={"PHOTO_CAMERA"}>
                        {t('furpanel.upload_area.title')}
                    </ToolLink>}
                    <ToolLink onClick={toolClick}
                        href="/user"
                        iconName={"PERSON"}>
                        {t('furpanel.user.title')}
                    </ToolLink>
                    {hasPermission(Permissions.CAN_SEE_ADMIN_PAGES, userDisplay) && <ToolLink onClick={toolClick}
                        href="/admin"
                        iconName={"SECURITY"}>
                        {t('furpanel.admin.title')}
                    </ToolLink>}
                    {DEBUG_ENABLED && <ToolLink href="/debug"
                        iconName={"BUG_REPORT"}>
                        {t('furpanel.debug.title')}
                    </ToolLink>}
                </div>
                <span>
                    <a href="#" className="hamburger rounded-l" onClick={() => setToolListExpanded(!toolListExpanded)}>
                        <Icon icon={toolListExpanded ? "CLOSE" : "MENU"}></Icon>
                    </a>
                </span>
            </div>

            {children}
        </div>
        <Modal icon={icon} title={title} open={isOpen} onClose={hideModal} zIndex={600}>{modalChildren}</Modal>
    </>;
}