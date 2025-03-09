"use client"
import Button from "@/components/button";
import Icon, { ICONS } from "@/components/icon";
import LoadingPanel from "@/components/loadingPanel";
import ModalError from "@/components/modalError";
import { AllRolesResponse, GetRolesApiAction, RoleInfo } from "@/lib/api/admin/role";
import { runRequest } from "@/lib/api/global";
import { useModalUpdate } from "@/components/context/modalProvider";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "@/styles/table.css";

export default function RolesListPage () {

    const router = useRouter();
    const t = useTranslations("furpanel");
    const tcommon = useTranslations("common");
    const {showModal} = useModalUpdate();

    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<RoleInfo[]> ();

    useEffect(()=>{
        loadRoles();
    }, []);

    const loadRoles = () => {
        if (loading) return;
        setRoles(undefined);
        setLoading(true);
        runRequest (new GetRolesApiAction())
        .then((response)=>setRoles((response as AllRolesResponse).roles))
        .catch((err)=>showModal(
            tcommon("error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="admin.pretix.data.errors"/>
        )).finally(()=>setLoading(false));
    }

    const editRole = (role: RoleInfo) => {
        router.push(`/admin/roles/${role.roleId}/data`);
    }

    return <div className="page">
        <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap">
            <a href="#" onClick={()=>router.back()}><Icon iconName={ICONS.ARROW_BACK}/></a>
            <div className="horizontal-list gap-2mm">
                <span className="title medium">{t("admin.users.security.roles.title")}</span>
            </div>

            <div className="spacer"></div>
            <Button iconName={ICONS.REFRESH} onClick={()=>loadRoles()} debounce={3000}>{tcommon("reload")}</Button>
            <Button iconName={ICONS.ADD} onClick={()=>{}} >{tcommon("CRUD.add")}</Button>
        </div>
        {/* Roles table */}
        <div className="table-container rounded-m">
            <div className="table rounded-m">
                {loading && <div className="row"><LoadingPanel className="data"/></div>}
                {roles?.map((role, ri) => <div key={ri} className="row horizontal-list flex-vertical-center gap-2mm flex-wrap"
                    onClick={()=>editRole(role)}>
                    <div className="data">
                        <span className="title average">{role.roleDisplayName}</span>
                    </div>
                    <div className="data">
                        <span className="descriptive average">{role.roleInternalName}</span>
                    </div>
                    <div className="spacer"></div>
                    <div className="data">
                        <span className="descriptive average">{t("admin.users.security.roles.list.permissions", {count: role.permissionsNumber})}</span>
                    </div>
                    <div className="data">
                    <span className="descriptive average">{t("admin.users.security.roles.list.members", {count: role.permanentUsersNumber})}</span>
                    </div>
                    <div className="data">
                    <span className="descriptive average">{t("admin.users.security.roles.list.temporary", {count: role.temporaryUsersNumber})}</span>
                    </div>
                </div>)}
            </div>
        </div>
    </div>
}