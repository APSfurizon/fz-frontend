import { ICONS } from "@/components/icon";
import Button from "@/components/input/button";
import FpTable from "@/components/table/fpTable";
import UserPicture from "@/components/userPicture";
import { GetUserAdminViewResponse } from "@/lib/api/admin/userView";
import { Fursuit } from "@/lib/api/badge/fursuits";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export default function UserViewFursuitsTable({
    userData
}: Readonly<{
    userData: GetUserAdminViewResponse
}>) {
    const t = useTranslations();
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fursuitColHelper = createColumnHelper<Fursuit>();
    const fursuitColumns: ColumnDef<Fursuit, any>[] = useMemo(()=>[
        fursuitColHelper.display({
            id: "propic",
            header: t("furpanel.admin.users.accounts.view.fursuit_table.picture"),
            cell: props => <UserPicture size={120} fursuitData={props.row.original.fursuit}/>
        }),
        fursuitColHelper.accessor('fursuit.name', {
            id: "fursuitName",
            header: t("furpanel.admin.users.accounts.view.fursuit_table.name")
        }),
        fursuitColHelper.accessor('fursuit.species', {
            id: "fursuitSpecies",
            header: t("furpanel.admin.users.accounts.view.fursuit_table.species")
        }),
        fursuitColHelper.display({
            id: "actions",
            header: '',
            enableResizing: false,
            maxSize: 90,
            cell: props => <div className="horizontal-list gap-2mm">
                <Button iconName={ICONS.HIDE_IMAGE}/>
                <Button iconName={ICONS.DELETE}/>
            </div>
        })
    ], [deleteLoading]);

    return <FpTable<Fursuit> rows={userData?.badgeData.fursuits}
                columns={fursuitColumns}
                enableSearch
                pinnedColumns={{right: ["actions"]}}/>;
}