import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import Checkbox from "@/components/input/checkbox";
import FpTable from "@/components/table/fpTable";
import { ChangeCardRegisterStatusApiAction, ChangeCardRegisterStatusApiData, MembershipCard } from "@/lib/api/admin/membershipManager";
import { GetUserAdminViewResponse } from "@/lib/api/admin/userView";
import { runRequest } from "@/lib/api/global";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { MouseEvent, useState } from "react";

export default function UserViewCardsTable({
    userData
}: Readonly<{
    userData: GetUserAdminViewResponse
}>) {
    const t = useTranslations();
    const {showModal} = useModalUpdate();

    // Registration logic
    const [registrationLoading, setRegistrationLoading] = useState(false);
    // Mark as registered
    const markAsRegistered = (event: MouseEvent<HTMLButtonElement>,
        checked: boolean, setChecked: (value: boolean) => void,
        setBusy: (value: boolean) => void, cardId: number) => {
        setBusy(true);
        const data: ChangeCardRegisterStatusApiData = {
            membershipCardId: cardId,
            registered: checked
        }
        runRequest(new ChangeCardRegisterStatusApiAction(), undefined, data, undefined)
            .catch((err) => {
                showModal(t("common.error"), <ErrorMessage error={err} />);
                setChecked(!checked);
            })
            .finally(() => setBusy(false));
    };

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
            cell: props => <Checkbox busy={registrationLoading}
                initialValue={props.getValue()}
                onClick={(event, checked, setChecked, setBusy) =>
                            markAsRegistered(event, checked, setChecked, setBusy, props.row.original.cardId)}/>
        })
    ]);

    return <FpTable<MembershipCard> rows={userData?.membershipCards}
                columns={cardColumns}
                enableSearch/>;
}