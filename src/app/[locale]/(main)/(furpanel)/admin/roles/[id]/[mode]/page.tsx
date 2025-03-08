"use client"
import Button from "@/components/button";
import Icon, { ICONS } from "@/components/icon";
import { EntityMode, parseEntityMode } from "@/lib/api/global";
import { useTranslations } from "next-intl";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewRolePage ({params}: Readonly<{params: Promise<{id: number, mode: string}>}>) {
    const router = useRouter();
    const t = useTranslations("furpanel");
    const tcommon = useTranslations("common");
    const [roleId, setRoleId] = useState<number> ();

    // Entity management
    const [entity, setEntity] = useState<any> ();
    const [entityMode, setEntityMode] = useState<EntityMode> ();
    const [entityChanged, setEntityChanged] = useState<boolean> ();

    useEffect(()=>{
        globalThis.onbeforeunload = () => {
            if (entityMode === EntityMode.EDIT && entityChanged) {
                return t("admin.users.security.roles.messages.discard_changes");
            }
        }
        params.then((loadedParams) => {
            let newId = loadedParams.id;
            let newMode = parseEntityMode(loadedParams.mode);
            if (newMode === undefined) {
                notFound();
            }
            if (!newId || isNaN(newId)) {
                if (newMode !== EntityMode.NEW) {
                    notFound();
                }
            }
            setRoleId(newId);
            setEntityMode(newMode);
        })
    }, []);

    useEffect(()=>{
        console.log(roleId, entityMode?.toString());
        
        
    }, [roleId, entityMode, entity])

    return <div className="page">
        <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap">
            <a href="#" onClick={()=>router.back()}><Icon iconName={ICONS.ARROW_BACK}/></a>
            <div className="horizontal-list gap-2mm">
                <span className="title medium">{t("admin.membership_manager.header")}</span>
            </div>

            <div className="spacer"></div>
            <Button iconName={ICONS.REFRESH} onClick={()=>{}} debounce={3000}>{tcommon("reload")}</Button>
            <Button iconName={ICONS.ADD} onClick={()=>{}} >{t("admin.membership_manager.actions.add")}</Button>
        </div>
    </div>
}