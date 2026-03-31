import FpTable from "@/components/table/fpTable";
import { GetUserAdminViewResponse } from "@/lib/api/admin/userView";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function UserViewPermissionsTable({
    userData
}: Readonly<{
    userData: GetUserAdminViewResponse
}>) {
    const t = useTranslations();
    const permissionColHelper = createColumnHelper<string>();
    const [permissionColumns] = useState<ColumnDef<string, any>[]>([
        permissionColHelper.accessor(val => val, {
            id: 'permission',
            header: t("furpanel.admin.users.accounts.view.permissions_table.permission")
        })
    ]);

    return <FpTable<string> rows={userData?.permissions}
        columns={permissionColumns}
        enableSearch />
}