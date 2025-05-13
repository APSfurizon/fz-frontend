"use client"
import Icon, { ICONS } from "@/components/icon";
import Button from "@/components/input/button";
import JanInput from "@/components/input/janInput";
import FpTable from "@/components/table/fpTable";
import { BadgeSearchData, FursuitBadge, RegularBadge, SearchFursuitBadgesResponse,
    SearchRegularBadgesResponse } from "@/lib/api/admin/advancedPrint";
import { ApiAction, runRequest } from "@/lib/api/global";
import { isEmpty } from "@/lib/utils";
import { ColumnDef, Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useRef, useState } from "react";

export default function BadgeTable<T extends FursuitBadge | RegularBadge,
    U extends SearchRegularBadgesResponse | SearchFursuitBadgesResponse> ({
    rows,
    setRows,
    columns,
    searchAction,
    getRowId,
    getRowsFromResult,
    title,
    icon
}: Readonly<{
    rows: T[],
    setRows: Dispatch<SetStateAction<T[]>>,
    columns: ColumnDef<T, any>[],
    searchAction: ApiAction<any, any>,
    getRowId: (row: T) => string,
    getRowsFromResult: (result: U) => T[],
    title: string,
    icon: string
}>) {
    const t = useTranslations();
    const [badgeSearchQuery, setBadgeSearchQuery] = useState<BadgeSearchData>();
    const [badgeLoading, setBadgeLoading] = useState(false);
    const table = useRef<Table<T>> (null);

    const searchBadges = () => {
        if (!badgeSearchQuery ||
            (isEmpty(badgeSearchQuery.orderQuery)
                && isEmpty(badgeSearchQuery.serialQuery))) return;
        setBadgeLoading(true);
        const params = new URLSearchParams();
        if (badgeSearchQuery?.serialQuery) params.append("orderSerials", badgeSearchQuery?.serialQuery);
        if (badgeSearchQuery?.orderQuery) params.append("orderCodes", badgeSearchQuery?.orderQuery);
        runRequest(searchAction, undefined, undefined, params)
        .then((result)=>{
            const response = result as U;
            setRows(prev=>{
                const toAdd = [...getRowsFromResult(response)];
                const ids = new Set(toAdd.map(bdg=>bdg.orderSerial));
                const existing = [...prev].filter(bdg=>!ids.has(bdg.orderSerial));
                return [...existing, ...toAdd];
            })
        }).finally(()=>{
            setBadgeLoading(false);
            setBadgeSearchQuery(undefined);
        })
    }

    const onDeleteRegularBadges = () => {
        if(!table.current) return;
        const selected = table.current.getSelectedRowModel();
        const idsToDelete = selected.flatRows.map(bdg=>getRowId(bdg.original));
        setRows(prev=>[...prev].filter(bdg=>!idsToDelete.includes(getRowId(bdg))))
    }

    return (<div className="vertical-list gap-2mm">
                <div className="horizontal-list flex-vertical-center">
                    <Icon iconName={icon}/>
                    <span className="title small">{title}</span>
                </div>
                <div className="horizontal-list gap-2mm">
                    <JanInput style={{flexGrow: 1}}
                        placeholder={t("furpanel.admin.events.badges.print.advanced_mode.search.serial.placeholder")}
                        onKeyDown={e=>e.key === "Enter" && searchBadges()}
                        onChange={e=>setBadgeSearchQuery({serialQuery: e.target.value})}
                        initialValue={badgeSearchQuery?.serialQuery}
                        disabled={badgeLoading}/>
                    <JanInput style={{flexGrow: 1}}
                        placeholder={t("furpanel.admin.events.badges.print.advanced_mode.search.order_code.placeholder")}
                        onKeyDown={e=>e.key === "Enter" && searchBadges()}
                        onChange={e=>setBadgeSearchQuery({orderQuery: e.target.value})}
                        initialValue={badgeSearchQuery?.orderQuery}
                        disabled={badgeLoading}/>
                    <Button busy={badgeLoading}
                        className="margin-bottom-1mm"
                        iconName={ICONS.SEARCH}
                        onClick={searchBadges}>
                            {t("furpanel.admin.events.badges.print.advanced_mode.Search")}
                    </Button>
                </div>
                <span className="descriptive tiny color-subtitle">
                    {t("furpanel.admin.events.badges.print.advanced_mode.search.help")}
                </span>
                
                <FpTable<T> columns={columns} rows={rows} showDeleteButton
                    enablePagination enableRowSelection enableMultiRowSelection sort={[{id: "serial", desc: false}]}
                    onDelete={onDeleteRegularBadges} tableConfigRef={table}/>
            </div>)
}