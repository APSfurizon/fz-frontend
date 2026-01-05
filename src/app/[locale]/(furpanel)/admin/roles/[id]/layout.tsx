"use client"
import { EntityEditorProvider } from "@/components/context/entityEditorProvider";
import { useModalUpdate } from "@/components/context/modalProvider";
import ModalError from "@/components/modalError";
import { GetRoleByIdApiAction, RoleData, roleToOutput, UpdateRoleByIdApiAction } from "@/lib/api/admin/role";
import { runRequest } from "@/lib/api/global";
import { useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

export default function ViewRoleLayout({ params, children }: Readonly<{ params: Promise<{ id: string }>, children: React.ReactNode }>) {
    const t = useTranslations("common");
    const { showModal } = useModalUpdate();
    const [roleId, setRoleId] = useState<number>();
    const [loading, setLoading] = useState(false);

    // Entity management
    const [entity, setEntity] = useState<RoleData>();

    // Parse params
    useEffect(() => {
        params.then((loadedParams) => {
            let newId = parseInt (loadedParams.id);
            if (newId === undefined || isNaN(newId)) {
                notFound();
            }
            setRoleId(newId);
        })
    }, []);

    // Load entity
    useEffect(() => {
        if (roleId === undefined) return;
        setLoading(true);
        getEntity()
            .then((response) => setEntity(response as RoleData))
            .catch((err) => showModal(t("error"), <ModalError error={err} />))
            .finally(() => setLoading(false));
    }, [roleId]);

    // Get the entity
    const getEntity = () => {
        if (roleId === undefined) return Promise.reject(null);
        return runRequest(new GetRoleByIdApiAction(), [roleId.toString()])
    }

    // Save entity
    const saveRole = (toSave: RoleData) => {
        return new Promise<RoleData>((resolve, reject) => {
            if (!toSave) return;
            setLoading(true);
            const toSend = roleToOutput(toSave);
            runRequest(new UpdateRoleByIdApiAction(), ["" + toSave.roleId], toSend)
                .then((response) => {
                    getEntity()
                        .then((data) => resolve(data as RoleData))
                        .catch((err) => reject(err));
                })
                .catch((err) => {
                    showModal(t("error"), <ModalError error={err} />);
                    reject(err);
                })
                .finally(() => setLoading(false));
        });
    }

    return <div className="page">
        <EntityEditorProvider<RoleData, RoleData> initialViewEntity={entity} loading={loading} onSave={saveRole}>
            {children}
        </EntityEditorProvider>
    </div>
}