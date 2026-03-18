import FpTable from "@/components/table/fpTable";
import { GetUserAdminViewResponse, UserViewRoles } from "@/lib/api/admin/userView";
import { ColumnDef, createColumnHelper, Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";

export default function UserViewRolesTable({
    userData
}: Readonly<{
    userData: GetUserAdminViewResponse
}>) {
    const t = useTranslations();
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
            header: t("furpanel.admin.users.accounts.view.roles_table.show_in_nosecount")
        }),
    ]);
    const roleTableWrapper = useRef<Table<UserViewRoles>>(null);

    const onRowDelete = useCallback(() => {
        const selectedRoles = roleTableWrapper.current?.getSelectedRowModel().rows?.map(row => row.original);
        const selectedRole = selectedRoles?.length ? selectedRoles[0] : undefined;
        if (selectedRole) {

        }
    }, []);

    return <FpTable<UserViewRoles> rows={userData?.roles}
        columns={roleColumns}
        enableSearch
        showAddButton
        showDeleteButton
        enableRowSelection
        onDelete={onRowDelete}
        tableConfigRef={roleTableWrapper} />
}