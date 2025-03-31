"use client"
import { useEntityEditor } from "@/components/context/entityEditorProvider";
import { AutoInputPermissionsManager, RoleData, RoleOutputData } from "@/lib/api/admin/role";
import { useTranslations } from "next-intl";
import Button from "@/components/input/button";
import { ICONS } from "@/components/icon";
import { useState } from "react";
import Modal from "@/components/modal";
import AutoInput from "@/components/input/autoInput";
import { AutoInputFilter, AutoInputSearchResult } from "@/lib/components/autoInput";
import "@/styles/table.css";
import DataForm from "@/components/input/dataForm";
import { DummyFormAction } from "@/lib/components/dataForm";

export default function RolePermissionsEditor () {
    const t = useTranslations();
    const {entity, setEntity} = useEntityEditor<RoleData, RoleData>();
    const [addPermissionOpen, setAddPermissionOpen] = useState(false);

    const [selectedPermissionTemp, setSelectedPermissionTemp] = useState<string> ();

    const removePermission = (code: string) => {
        const newEntity = {...entity, enabledPermissions: [...entity.enabledPermissions].filter (v => v !== code)};
        setEntity(newEntity);
    }

    const addPermission = () => {
        if (!selectedPermissionTemp) return;
        const newEntity = {...entity, enabledPermissions: [...entity.enabledPermissions, selectedPermissionTemp]};
        setEntity(newEntity);
        closeAddPermissionModal();
    }

    const selectPermission = (values: AutoInputSearchResult[], newValues?: AutoInputSearchResult[], removedValue?: AutoInputSearchResult) => {
        const permission = newValues && newValues.length > 0 ? newValues[0] : undefined;
        setSelectedPermissionTemp(permission?.code);
    }

    const closeAddPermissionModal = () => {
        setAddPermissionOpen(false);
        setSelectedPermissionTemp(undefined);
    }

    return <>
    <div className="horizontal-list gap-2mm">
        <div className="spacer"></div>
        <Button iconName={ICONS.ADD} onClick={()=>{setAddPermissionOpen(true)}}>{t("common.CRUD.add")}</Button>
    </div>
    {/* Permissions table */}
    <div className="table-container rounded-m">
        <div className="table rounded-m">
            {entity?.enabledPermissions?.map((permission, pi) => <div key={pi} className="row horizontal-list flex-vertical-center gap-2mm flex-wrap">
                <div className="data">
                    <span className="title average">{permission}</span>
                </div>
                <div className="spacer"></div>
                <div className="data">
                    <Button iconName={ICONS.DELETE} onClick={() => removePermission (permission)}></Button>
                </div>
            </div>)}
        </div>
    </div>
    <Modal open={addPermissionOpen} onClose={()=>closeAddPermissionModal()}
        title={t("furpanel.admin.users.security.roles.input.add_permission.label")} style={{minWidth: '400px'}}>
        <DataForm action={new DummyFormAction} shouldReset={!addPermissionOpen} hideSave>
            <AutoInput manager={new AutoInputPermissionsManager} minDecodeSize={0}
                filterOut={new AutoInputFilter ([], entity?.enabledPermissions)}
                onChange={selectPermission}>
            </AutoInput>
        </DataForm>
        <div className="horizontal-list gap-4mm">
            <Button type="button" className="danger" iconName={ICONS.CANCEL} 
                onClick={()=>setAddPermissionOpen(false)}>{t("common.cancel")}</Button>
            <div className="spacer"></div>
            <Button type="submit" className="success" iconName={ICONS.CHECK}
                onClick={()=>addPermission()} disabled={!!!selectedPermissionTemp}>
                    {t("common.confirm")}
            </Button>
        </div>
    </Modal>
    </>
}