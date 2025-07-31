"use client"
import Button from "@/components/input/button";
import { useEntityEditor } from "@/components/context/entityEditorProvider";
import Icon from "@/components/icon";
import ToolLink from "@/components/toolLink";
import { RoleData } from "@/lib/api/admin/role";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getParentDirectory } from "@/lib/utils";

export default function RoleEditorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const path = usePathname();
    const t = useTranslations();

    // Get context
    const { entity, entityChanged, saveEntity, loading } = useEntityEditor<RoleData, RoleData>();

    return <>
        <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap">
            <Link href={getParentDirectory(getParentDirectory(path))}><Icon icon={"ARROW_BACK"} /></Link>
            <div className="horizontal-list gap-2mm">
                <span className="title medium">
                    {entity?.displayName ?? entity?.internalName ?? ""}
                    {entityChanged && "*"}
                </span>
            </div>
            <div className="spacer"></div>
            <ToolLink iconName={"ID_CARD"} href="data">{t("furpanel.admin.users.security.roles.sections.data")}</ToolLink>
            <ToolLink iconName={"SECURITY"} href="permissions">{t("furpanel.admin.users.security.roles.sections.permissions")}</ToolLink>
            <ToolLink iconName={"GROUPS"} href="members">{t("furpanel.admin.users.security.roles.sections.members")}</ToolLink>
        </div>
        {children}
        <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap">
            <div className="spacer"></div>
            <Button disabled={!entity || !entityChanged} iconName={"SAVE"} onClick={() => { saveEntity(entity) }} busy={loading}>{t("common.CRUD.save")}</Button>
        </div>
    </>
}