import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import AutoInput from "@/components/input/autoInput";
import Checkbox from "@/components/input/checkbox";
import DataForm from "@/components/input/dataForm";
import Modal from "@/components/modal";
import FpTable from "@/components/table/fpTable";
import { AddUserToRoleFormApiAction, AutoInputRolesManager, GetUserAdminViewResponse, RemoveUserFromRoleApiAction, UserViewRoles } from "@/lib/api/admin/userView";
import { runRequest } from "@/lib/api/global";
import { AutoInputFilter } from "@/lib/components/autoInput";
import { ColumnDef, createColumnHelper, Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";

export default function UserViewRolesTable({
    userData,
    reloadData
}: Readonly<{
    userData: GetUserAdminViewResponse,
    reloadData: () => void
}>) {
    const t = useTranslations();
    const { showModal } = useModalUpdate();
    const roleColHelper = createColumnHelper<UserViewRoles>();
    const [roleColumns] = useState<ColumnDef<UserViewRoles, any>[]>([
        roleColHelper.accessor("displayName", {
            id: 'displayName',
            header: t("furpanel.admin.users.accounts.view.roles_table.display_name")
        }),
        roleColHelper.accessor("internalName", {
            id: 'internalName',
            header: t("furpanel.admin.users.accounts.view.roles_table.internal_name")
        }),
        roleColHelper.accessor("showInNosecount", {
            id: 'showInNosecount',
            header: t("furpanel.admin.users.accounts.view.roles_table.show_in_nosecount"),
            cell: props => <Checkbox initialValue={props.row.original.showInNosecount} disabled />,
        }),
    ]);
    const roleTableWrapper = useRef<Table<UserViewRoles>>(null);

    const onRowDelete = useCallback(() => {
        const selectedRoles = roleTableWrapper.current?.getSelectedRowModel().rows?.map(row => row.original);
        const selectedRole = selectedRoles?.length ? selectedRoles[0] : undefined;
        if (selectedRole) {
            runRequest({
                action: new RemoveUserFromRoleApiAction(),
                pathParams: { "id": selectedRole.roleId },
                body: {
                    userId: userData.personalInfo.userId
                }
            }).then(() => {
                reloadData();
            }).catch((error) => showModal(t("common.error"), <ErrorMessage error={error} />))
        }
    }, []);

    // Add modal logic
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<number>();

    return <>
        <FpTable<UserViewRoles> rows={userData?.roles}
            columns={roleColumns}
            enableSearch
            showAddButton
            showDeleteButton
            enableRowSelection
            onDelete={onRowDelete}
            onAdd={() => setAddModalOpen(true)}
            tableConfigRef={roleTableWrapper} />
        <Modal open={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            title={t("furpanel.admin.users.accounts.view.roles_table.actions.add_role.title")}>
            <DataForm
                action={new AddUserToRoleFormApiAction()}
                shouldReset={!addModalOpen}
                pathParams={{ "id": selectedRoleId }}
                onSuccess={() => { setAddModalOpen(false); reloadData(); }}>
                <input type="hidden" name="userId" value={userData.personalInfo?.userId} />
                <AutoInput manager={new AutoInputRolesManager()}
                    fieldName="role"
                    label={t("furpanel.admin.users.accounts.view.roles_table.actions.add_role.form.role.label")}
                    minDecodeSize={1}
                    filterOut={new AutoInputFilter(userData.roles?.map(role => role.roleId), [])}
                    onChange={(params) => setSelectedRoleId(params.values[0]?.id ?? undefined)}
                    required />
                <Checkbox fieldName="tempRole">
                    {t("furpanel.admin.users.accounts.view.roles_table.actions.add_role.form.temporary.label")}
                </Checkbox>
            </DataForm>
        </Modal>
    </>
}