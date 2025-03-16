"use client"
import Button from "@/components/button";
import { useEntityEditor } from "@/components/context/entityEditorProvider";
import Icon, { ICONS } from "@/components/icon";
import ToolLink from "@/components/toolLink";
import { RoleData, RoleOutputData } from "@/lib/api/admin/role";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RoleEditorLayout ({children}: Readonly<{children: React.ReactNode}>) {
    const router = useRouter();
    const t = useTranslations();

    // Get context
    const {entity, entityChanged, saveEntity, loading} = useEntityEditor<RoleData, RoleData>();

    return <>
    <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap">
        <Link href="/admin/roles"><Icon iconName={ICONS.ARROW_BACK}/></Link>
        <div className="horizontal-list gap-2mm">
            <span className="title medium">
                {entity?.displayName ?? entity?.internalName ?? ""}
                {entityChanged && "*"}
            </span>
        </div>
        <div className="spacer"></div>
        <ToolLink iconName={ICONS.ID_CARD} href="data">{t("furpanel.admin.users.security.roles.sections.data")}</ToolLink>
        <ToolLink iconName={ICONS.SECURITY} href="permissions">{t("furpanel.admin.users.security.roles.sections.permissions")}</ToolLink>
        <ToolLink iconName={ICONS.GROUPS} href="members">{t("furpanel.admin.users.security.roles.sections.members")}</ToolLink>
    </div>
    {children}
    <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap">
        <div className="spacer"></div>
        <Button disabled={!entity || !entityChanged} iconName={ICONS.SAVE} onClick={()=>{saveEntity (entity)}} busy={loading}>{t("common.CRUD.save")}</Button>
    </div>
    </>
}