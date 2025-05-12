"use client"
import Button from "@/components/input/button";
import Icon, { ICONS } from "@/components/icon";
import LoadingPanel from "@/components/loadingPanel";
import ModalError from "@/components/modalError";
import { AddRoleApiResponse, AddRoleFormAction, AllRolesResponse,
    DeleteRolesApiAction, GetRolesApiAction, RoleInfo } from "@/lib/api/admin/role";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/lib/api/global";
import { useModalUpdate } from "@/components/context/modalProvider";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { MouseEvent, useEffect, useState } from "react";
import Modal from "@/components/modal";
import DataForm from "@/components/input/dataForm";
import JanInput from "@/components/input/janInput";
import FpTable from "@/components/table/fpTable";
import { createColumnHelper } from "@tanstack/react-table";
import { getParentDirectory } from "@/lib/utils";

export default function RolesListPage () {

    const router = useRouter();
    const path = usePathname();
    const t = useTranslations();
    const {showModal} = useModalUpdate();

    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<RoleInfo[]> ([]);

    useEffect(()=>{
        loadRoles();
    }, []);

    const loadRoles = () => {
        if (loading) return;
        setRoles([]);
        setLoading(true);
        runRequest (new GetRolesApiAction())
        .then((response)=>setRoles((response as AllRolesResponse).roles))
        .catch((err)=>showModal(
            t("common.error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="admin.users.security.roles.errors"/>
        )).finally(()=>setLoading(false));
    }

    const editRole = (role: RoleInfo) => {
        router.push(`/admin/roles/${role.roleId}/data`);
    }

    /* Role creation logic */
    const [addRoleModalOpen, setAddRoleModalOpen] = useState(false);
    
    const promptCreateRole = () => {
        setAddRoleModalOpen(true);
    }

    const onAddSuccess = (r: AddRoleApiResponse) => {
        router.push(`/admin/roles/${r.roleId}/data`);
    }

    const onAddFail = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
        showModal(
            t("common.error"),
            <ModalError error={err} translationRoot="furpanel"
                translationKey="admin.users.security.roles.errors"/>
        );
        setAddRoleModalOpen(false);
    }

    /* Role deletion logic */
    const [deleteRoleModalOpen, setDeleteRoleModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RoleInfo>();

    const promptDeleteRole = (e: MouseEvent<Element>, role: RoleInfo) => {
        setSelectedRole(role);
        setDeleteRoleModalOpen(true);
        e.preventDefault();
        e.stopPropagation();
    };

    const closeDeleteRoleModal = () => {
        setDeleteRoleModalOpen(false);
        setSelectedRole(undefined);
    }

    const deleteRole = (roleId?: number) => {
        if (!roleId) return;
        setLoading(true);
        runRequest(new DeleteRolesApiAction(), [""+roleId])
        .then(()=>loadRoles())
        .catch((err)=>showModal(
            t("common.error"), 
            <ModalError error={err} translationRoot="furpanel" translationKey="admin.users.security.roles.errors"/>
        )).finally(()=>{
            setLoading(false);
            closeDeleteRoleModal();
        });
    }

    const [initialTableConfig] = useState(()=>{
        return {
            getRowId: (originalRow: RoleInfo) => String(originalRow.roleId)
        }
    });

    const columnHelper = createColumnHelper<RoleInfo>();

    const [columns] = useState(()=>{
        return [
            columnHelper.accessor('roleDisplayName', {
                header: t("furpanel.admin.users.security.roles.columns.name")
            }),
            columnHelper.accessor('roleInternalName', {
                header: t("furpanel.admin.users.security.roles.columns.internal_name")
            }),
            columnHelper.accessor('permissionsNumber', {
                header: t("furpanel.admin.users.security.roles.columns.permission_count")
            }),
            columnHelper.accessor('permanentUsersNumber', {
                header: t("furpanel.admin.users.security.roles.columns.members_count")
            }),
            columnHelper.accessor('temporaryUsersNumber', {
                header: t("furpanel.admin.users.security.roles.columns.temporary_members_count")
            }),
            columnHelper.display({
                id: 'actions',
                enableResizing: false,
                maxSize: 88,
                size: 88,
                cell: props => <div className="horizontal-list gap-2mm">
                        <Button onClick={()=>editRole(props.row.original)}
                            iconName={ICONS.EDIT}
                            title={t("common.CRUD.edit")}/>
                        <Button className="danger"
                            onClick={(e)=>promptDeleteRole(e, props.row.original)}
                            iconName={ICONS.DELETE}
                            title={t("common.CRUD.delete")}/>
                    </div>
            })
        ];
    });

    return <>
    <div className="page">
        <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap">
            <a href={getParentDirectory(path)}><Icon iconName={ICONS.ARROW_BACK}/></a>
            <div className="horizontal-list gap-2mm">
                <span className="title medium">{t("furpanel.admin.users.security.roles.title")}</span>
            </div>

            <div className="spacer"></div>
            <Button iconName={ICONS.REFRESH} onClick={()=>loadRoles()} debounce={3000}>{t("common.reload")}</Button>
            <Button iconName={ICONS.ADD} onClick={promptCreateRole} >{t("common.CRUD.add")}</Button>
        </div>
        
        {loading && <div className="row"><LoadingPanel className="data"/></div>}
        <FpTable<RoleInfo> rows={roles}
            columns={columns}
            tableOptions={initialTableConfig}
            pinnedColumns={{left: [], right: ['actions']}}/>
    </div>
    {/* Role creation modal */}
    <Modal open={addRoleModalOpen} onClose={()=>setAddRoleModalOpen(false)}
        title={t("furpanel.admin.users.security.roles.actions.add_role")}>
            <DataForm shouldReset={!addRoleModalOpen} setLoading={setLoading} loading={loading}
                action={new AddRoleFormAction} onSuccess={(data)=>onAddSuccess(data as AddRoleApiResponse)}
                onFail={onAddFail} resetOnSuccess hideSave className="vertical-list gap-2mm">
                <span className="descriptive">{t("furpanel.admin.users.security.roles.messages.add_role")}</span>
                <JanInput fieldName="internalName" pattern={/^[A-Za-z0-9_\-]{3,64}$/gmi}></JanInput>
                <div className="bottom-toolbar">
                    <Button title={t("common.cancel")} className="danger" onClick={()=>setAddRoleModalOpen(false)}
                        iconName={ICONS.CANCEL} busy={loading}>{t("common.cancel")}</Button>
                    <div className="spacer"></div>
                    <Button title={t("common.CRUD.add")} type="submit"
                        iconName={ICONS.ADD_CIRCLE} busy={loading}>{t("common.CRUD.add")}</Button>    
                </div>
            </DataForm>
    </Modal>
    {/* Role deletion modal */}
    <Modal open={deleteRoleModalOpen} onClose={()=>closeDeleteRoleModal()}
        title={t("furpanel.admin.users.security.roles.actions.delete_role")}>
            <span className="descriptive">{t("furpanel.admin.users.security.roles.messages.confirm_deletion", 
                {
                    roleName: selectedRole?.roleDisplayName ?? selectedRole?.roleInternalName ?? "",
                    members: selectedRole?.permanentUsersNumber,
                    tempMembers: selectedRole?.temporaryUsersNumber
                })}
            </span>
            <div className="bottom-toolbar">
                <Button title={t("common.cancel")} className="danger" onClick={closeDeleteRoleModal}
                    iconName={ICONS.CANCEL} busy={loading}>{t("common.cancel")}</Button>
                <div className="spacer"></div>
                <Button title={t("common.CRUD.delete")} onClick={()=>deleteRole(selectedRole?.roleId)}
                    iconName={ICONS.DELETE} busy={loading}>{t("common.CRUD.delete")}</Button>    
            </div>
    </Modal>
    </>
}