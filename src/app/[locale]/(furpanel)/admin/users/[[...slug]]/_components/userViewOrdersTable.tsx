import { useModalUpdate } from "@/components/context/modalProvider";
import Button from "@/components/input/button";
import Checkbox from "@/components/input/checkbox";
import ErrorMessage from "@/components/errorMessage";
import StatusBox from "@/components/statusBox";
import FpTable from "@/components/table/fpTable";
import { FullOrder, GetUserAdminViewResponse, ViewOrderLinkApiAction } from "@/lib/api/admin/userView";
import { mapOrderStatusToStatusBox, qrCodeLogo, qrCodeOptions } from "@/lib/api/booking";
import { runRequest } from "@/lib/api/global";
import { translate } from "@/lib/translations";
import { buildSearchParams } from "@/lib/utils";
import { createColumnHelper, Row } from "@tanstack/react-table";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import LinkOrderModal from "./orders/linkOrderModal";
import { useQRCode } from "next-qrcode";

export default function UserViewOrdersTable({
    userData
}: Readonly<{
    userData: GetUserAdminViewResponse
}>) {
    const t = useTranslations();
    const formatter = useFormatter();
    const locale = useLocale();
    const { showModal } = useModalUpdate();
    const [viewOrderLoading, setViewOrderLoading] = useState(false);
    const { Canvas } = useQRCode();

    const viewOrder = (eventId: number, orderCode: string) => {
        setViewOrderLoading(true);
        runRequest({
            action: new ViewOrderLinkApiAction(),
            searchParams: buildSearchParams({ "event-id": String(eventId), "order-code": orderCode })
        }).then((result) => window.open(result.link, '_blank'))
            .catch((err) => showModal(t("common.error"), <ErrorMessage error={err} />, "ERROR"))
            .finally(() => setViewOrderLoading(false));
    }

    const renderDailyDaysDates = (row: Row<FullOrder>) => {
        const dailyDays = row.original.dailyDaysDates.toSorted().map(day => formatter.dateTime(new Date(day), { dateStyle: "medium" }))
        return <div className="vertical-list">
            <span className="title medium">{t("furpanel.admin.users.accounts.view.orders_table.daily_days")}</span>
            {dailyDays.map((d, i) => <span className="monospace" key={i}>{d}</span>)}
        </div>
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
        orderColHelper.accessor('orderSerialInEvent', {
            id: 'orderSerialInEvent',
            header: t("furpanel.admin.users.accounts.view.orders_table.event_order_serial")
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
        orderColHelper.accessor("board", {
            id: "board",
            header: t("furpanel.admin.users.accounts.view.rooms_table.board"),
        }),
        orderColHelper.display({
            id: 'actionViewOrder',
            header: '',
            cell: props => <div className="horizontal-list gap-2mm">
                <Button icon="OPEN_IN_NEW"
                    key={`op-${props.row.original.eventId}-${props.row.original.code}`}
                    onClick={() => viewOrder(props.row.original.eventId, props.row.original.code)}
                    busy={viewOrderLoading} />
                <Button icon="QR_CODE"
                    key={`qr-${props.row.original.eventId}-${props.row.original.code}`}
                    onClick={() => showModal(t("furpanel.admin.users.accounts.view.orders_table.actions.view_qr.title"),
                        <div className="vertical-list">
                            <Canvas text={props.row.original.checkinSecret}
                                options={qrCodeOptions}
                                logo={qrCodeLogo}
                            />
                            <span className="monospace">{props.row.original.code}</span>
                        </div>
                    )} />
            </div>,
            maxSize: 86,
            enableResizing: false
        })
    ], [viewOrderLoading]);

    return <FpTable<FullOrder> rows={userData?.orders}
        columns={orderColumns}
        key={String(viewOrderLoading)}
        pinnedColumns={{ right: ["actionViewOrder"] }}
        enableSearch
        hasDetails={(row) => (row.original.dailyDaysDates ?? []).length > 0}
        getDetails={renderDailyDaysDates}>
        <LinkOrderModal />
    </FpTable>
}
