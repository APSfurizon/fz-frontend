import { useModalUpdate } from "@/components/context/modalProvider";
import Button from "@/components/input/button";
import Checkbox from "@/components/input/checkbox";
import ModalError from "@/components/modalError";
import StatusBox from "@/components/statusBox";
import FpTable from "@/components/table/fpTable";
import { FullOrder, GetUserAdminViewResponse, ViewOrderLinkApiAction, ViewOrderLinkResponse } from "@/lib/api/admin/userView";
import { mapOrderStatusToStatusBox } from "@/lib/api/booking";
import { runRequest } from "@/lib/api/global";
import { translate } from "@/lib/translations";
import { buildSearchParams } from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export default function UserViewOrdersTable({
    userData
}: Readonly<{
    userData: GetUserAdminViewResponse
}>) {
    const t = useTranslations();
    const locale = useLocale();
    const { showModal } = useModalUpdate();
    const [viewOrderLoading, setViewOrderLoading] = useState(false);

    const viewOrder = (eventId: number, orderCode: string) => {
        setViewOrderLoading(true);
        runRequest(new ViewOrderLinkApiAction(), undefined, undefined,
            buildSearchParams({ "event-id": String(eventId), "order-code": orderCode }))
            .then((result) => window.open((result as ViewOrderLinkResponse).link, '_blank'))
            .catch((err) => showModal(t("common.error"), <ModalError error={err} />, "ERROR"))
            .finally(() => setViewOrderLoading(false));
    }

    const orderColHelper = createColumnHelper<FullOrder>();
    const orderColumns = useMemo(() => [
        orderColHelper.accessor(itm => translate(itm.orderEvent.eventNames, locale), {
            id: 'eventName',
            header: t("furpanel.admin.users.accounts.view.orders_table.event_name")
        }),
        orderColHelper.accessor('code', {
            id: 'orderCode',
            header: t("furpanel.admin.users.accounts.view.orders_table.order_code"),
        }),
        orderColHelper.accessor(itm => t(`common.order_status.${itm.orderStatus}`), {
            id: 'orderStatus',
            header: t("furpanel.admin.users.accounts.view.orders_table.order_status"),
            cell: props => (
                <StatusBox status={mapOrderStatusToStatusBox(props.row.original.orderStatus)}>
                    {t(`common.order_status.${props.row.original.orderStatus}`)}
                </StatusBox>)
        }),
        orderColHelper.accessor(itm => itm.daily ? 'daily' : '', {
            id: 'isDaily',
            header: t("furpanel.admin.users.accounts.view.orders_table.is_daily"),
            cell: props => <Checkbox initialValue={props.row.original.daily} disabled />
        }),
        orderColHelper.accessor('sponsorship', {
            id: 'sponsorship',
            header: t("furpanel.admin.users.accounts.view.orders_table.sponsorship_type"),
        }),
        orderColHelper.accessor('extraDays', {
            id: 'extraDays',
            header: t("furpanel.admin.users.accounts.view.orders_table.extra_days"),
        }),
        orderColHelper.accessor(itm => itm.roomCapacity > 0 ? `${itm.hotelInternalName} - ${itm.roomInternalName} (${itm.roomCapacity})` : undefined,
            {
                id: 'roomType',
                header: t("furpanel.admin.users.accounts.view.orders_table.room_type"),
            }),
        orderColHelper.display({
            id: 'actionViewOrder',
            header: '',
            cell: props => <Button iconName={"OPEN_IN_NEW"}
                key={`${props.row.original.eventId}-${props.row.original.code}`}
                onClick={() => viewOrder(props.row.original.eventId, props.row.original.code)}
                busy={viewOrderLoading} />,
            maxSize: 50,
            enableResizing: false
        })
    ], [viewOrderLoading]);

    return <FpTable<FullOrder> rows={userData?.orders}
        columns={orderColumns}
        key={String(viewOrderLoading)}
        pinnedColumns={{ right: ["actionViewOrder"] }}
        enableSearch />
}
