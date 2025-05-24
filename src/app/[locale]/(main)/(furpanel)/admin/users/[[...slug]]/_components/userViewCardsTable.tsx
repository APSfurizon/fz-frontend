import Checkbox from "@/components/input/checkbox";
import FpTable from "@/components/table/fpTable";
import { MembershipCard } from "@/lib/api/admin/membershipManager";
import { GetUserAdminViewResponse } from "@/lib/api/admin/userView";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function UserViewCardsTable({
    userData
}: Readonly<{
    userData: GetUserAdminViewResponse
}>) {
    const t = useTranslations();
    const cardColHelper = createColumnHelper<MembershipCard>();
    const [cardColumns] = useState<ColumnDef<MembershipCard, any>[]>([
        cardColHelper.accessor(itm => `${(itm.cardNo ?? '').padStart(7, '0')}`, {
            id: 'cardNumber',
            header: t("furpanel.admin.membership_manager.columns.card_number")
        }),
        cardColHelper.accessor('issueYear', {
            id: 'issuedYear',
            header: t("furpanel.admin.users.accounts.view.cards_table.issue_year")
        }),
        cardColHelper.accessor(itm => itm.registered, {
            id: 'registered',
            header: t("furpanel.admin.membership_manager.columns.registered"),
            cell: props => <Checkbox disabled initialValue={props.getValue()}/>
        })
    ]);

    return <FpTable<MembershipCard> rows={userData?.membershipCards}
                columns={cardColumns}
                enableSearch/>;
}