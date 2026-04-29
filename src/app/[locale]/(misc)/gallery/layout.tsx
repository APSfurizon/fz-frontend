"use client"
import { useUser } from "@/components/context/userProvider";
import Icon from "@/components/icon";
import ToolLink from "@/components/toolLink";
import { hasPermission, Permissions } from "@/lib/api/permission";
import { useTranslations } from "next-intl";
import { useState } from "react";
import "@/styles/misc/gallery/layout.css";
import { GalleryProvider } from "./_components/galleryProvider";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [toolListExpanded, setToolListExpanded] = useState(false);
    const { userDisplay } = useUser();
    const t = useTranslations();

    const toolClick = () => {
        setToolListExpanded(false);
    }

    return <div className="main-dialog rounded-s">
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
                <ToolLink onClick={toolClick}
                    href="/gallery/explore"
                    icon="BROWSE">
                    {t('misc.gallery.explore.title')}
                </ToolLink>
                {userDisplay && <ToolLink onClick={toolClick}
                    href="/gallery/upload"
                    icon="CLOUD_UPLOAD">
                    {t('misc.gallery.upload.title')}
                </ToolLink>}
                {hasPermission(Permissions.CAN_SEE_ADMIN_PAGES, userDisplay) && <ToolLink onClick={toolClick}
                    href="/gallery/admin"
                    icon="SECURITY">
                    {t('misc.gallery.admin.title')}
                </ToolLink>}
            </div>
            <span>
                <div role="button" className="hamburger rounded-l" onClick={() => setToolListExpanded(!toolListExpanded)}>
                    <Icon icon={toolListExpanded ? "CLOSE" : "MENU"} />
                </div>
            </span>
        </div>
        <GalleryProvider>
            {children}
        </GalleryProvider>
    </div>
}