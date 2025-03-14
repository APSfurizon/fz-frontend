"use client"
import { EntityEditorProvider } from "@/components/context/entityEditorProvider";
import { useModalUpdate } from "@/components/context/modalProvider";
import LoadingPanel from "@/components/loadingPanel";
import ModalError from "@/components/modalError";
import { GetRoleByIdApiAction, RoleData, RoleOutputData, roleToOutput, UpdateRoleByIdApiAction } from "@/lib/api/admin/role";
import { runRequest } from "@/lib/api/global";
import { resultSelf } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewRoleLayout ({params, children}: Readonly<{params: Promise<{id: number}>, children: React.ReactNode}>) {
    const t = useTranslations("common");
    const {showModal} = useModalUpdate();
    const [roleId, setRoleId] = useState<number>();
    const [loading, setLoading] = useState(false);
    
    // Entity management
    const [entity, setEntity] = useState<RoleData>();

    // Parse params
    useEffect(()=>{
        params.then((loadedParams) => {
            let newId = loadedParams.id;
            if (newId === undefined || isNaN(newId)) {
                notFound();
            }
            setRoleId(newId);
        })
    }, []);

    // Load entity
    useEffect(()=>{
        if (roleId === undefined) return;
        setLoading(true);
        runRequest(new GetRoleByIdApiAction(), [roleId.toString()])
        .then ((response) => setEntity(response as RoleData))
        .catch((err)=>showModal(
            t("error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="admin.users.security.roles.errors"></ModalError>
        )).finally (()=>setLoading(false));
    }, [roleId]);

    // Save entity
    const saveRole = (toSave: RoleData) => {
        if (!toSave) return;
        setLoading(true);
        const toSend = roleToOutput(toSave);
        runRequest(new UpdateRoleByIdApiAction(), [""+toSave.roleId], toSend)
        .then ((response) => setRoleId(roleId))
        .catch((err)=>showModal(
            t("error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="admin.users.security.roles.errors"></ModalError>
        )).finally (()=>setLoading(false));
    }

    return <div className="page">
        <EntityEditorProvider<RoleData, RoleData> initialViewEntity={entity} loading={loading} onSave={saveRole}>
            {children}
        </EntityEditorProvider>
    </div>
}