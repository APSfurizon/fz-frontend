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

const ADMIN_ROLE_NAMES = new Set(["root", "main_staff", "super_admin", "admin"]);

function normalizeRole(internalName?: string) {
    return (internalName ?? "").toLowerCase().trim();
}

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

    const roles = userDisplay?.roles ?? [];
    const canSeeAdminPages = hasPermission(Permissions.CAN_SEE_ADMIN_PAGES, userDisplay);
    const isTeamSecurity = roles.some((role) => normalizeRole(role.internalName) === "team_security");
    const isAdminRole = roles.some((role) => ADMIN_ROLE_NAMES.has(normalizeRole(role.internalName)));
    const securityOnlyMode = isTeamSecurity && !isAdminRole;

    return <>
        <div className="main-dialog rounded-s">
            <div className="horizontal-list gap-4mm">
                <span>
                    <span className="title-pair">
                        <Icon icon="DESIGN_SERVICES" />
                        <span className="titular bold highlight">furpanel</span>
                    </span>
                </span>
                <div className="spacer"></div>
                <div className={`tools-list horizontal-list flex-wrap gap-4mm ${toolListExpanded ? "expanded" : ""}`}
                    style={{ justifyContent: 'flex-end' }}>
                    {BOOKING_ENABLED && <ToolLink onClick={toolClick}
                        href="/booking"
                        icon="LOCAL_ACTIVITY">
                        {t('furpanel.booking.title')}
                    </ToolLink>}
                    {BADGE_ENABLED && <ToolLink onClick={toolClick}
                        href="/badge"
                        icon="PERSON_BOOK">
                        {t('furpanel.badge.title')}
                    </ToolLink>}
                    {ROOM_ENABLED && <ToolLink onClick={toolClick}
                        href="/room"
                        icon="BED">
                        {t('furpanel.room.title')}
                    </ToolLink>}
                    {UPLOAD_ENABLED && <ToolLink onClick={toolClick}
                        href="/upload-area"
                        icon="PHOTO_CAMERA">
                        {t('furpanel.upload_area.title')}
                    </ToolLink>}
                    <ToolLink onClick={toolClick}
                        href="/user"
                        icon="PERSON">
                        {t('furpanel.user.title')}
                    </ToolLink>
                    {canSeeAdminPages && !securityOnlyMode && <ToolLink onClick={toolClick}
                        href="/admin"
                        icon="SECURITY">
                        {t('furpanel.admin.title')}
                    </ToolLink>}
                    {canSeeAdminPages && securityOnlyMode && <ToolLink onClick={toolClick}
                        href="/admin"
                        icon="GPP_GOOD">
                        {t('furpanel.security.title')}
                    </ToolLink>}
                    {DEBUG_ENABLED && <ToolLink href="/debug"
                        icon="BUG_REPORT">
                        {t('furpanel.debug.title')}
                    </ToolLink>}
                </div>
                <span>
                    <div role="button" className="hamburger rounded-l" onClick={() => setToolListExpanded(!toolListExpanded)}>
                        <Icon icon={toolListExpanded ? "CLOSE" : "MENU"} />
                    </div>
                </span>
            </div>

            {children}
        </div>
        <Modal icon={icon} title={title} open={isOpen} onClose={hideModal} zIndex={600}>{modalChildren}</Modal>
    </>;
}