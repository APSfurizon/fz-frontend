"use client";

import Icon from "@/components/icon";
import Button from "@/components/input/button";
import UserPicture from "@/components/userPicture";
import {
    FursuitBadge, RegularBadge, SearchFursuitBadgesApiAction, SearchFursuitBadgesResponse,
    SearchRegularBadgesApiAction, SearchRegularBadgesResponse
} from "@/lib/api/admin/advancedPrint";
import { runRequest } from "@/lib/api/global";
import useTitle from "@/components/hooks/useTitle";
import { buildSearchParams, getParentDirectory, isEmpty } from "@/lib/utils";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import BadgeTable from "./badgeTable";
import { useModalUpdate } from "@/components/context/modalProvider";
import ModalError from "@/components/modalError";
import { GetRenderedCommonBadgesApiAction, GetRenderedFursuitBadgesApiAction } from "@/lib/api/admin/badge";

export default function AdvancedBadgePrint() {
    const t = useTranslations();
    const path = usePathname();
    const { showModal } = useModalUpdate();
    useTitle(t("furpanel.admin.events.badges.print.advanced_mode.title"));

    const [printLoading, setPrintLoading] = useState(false);

    /* Regular badges table */
    const regularColumnHelper = createColumnHelper<RegularBadge>();
    const [regularBadgeRows, setRegularBadgeRows] = useState<RegularBadge[]>([]);
    const [regularColumns] = useState(() => [
        regularColumnHelper.accessor('user', {
            id: 'user',
            header: t("furpanel.admin.events.badges.print.advanced_mode.regular.columns.user"),
            cell: props => <div className="data horizontal-list flex-vertical-center gap-2mm">
                <UserPicture userData={props.row.original.user} hideEffect></UserPicture>
                <span className="title small">{props.row.original.user.fursonaName}</span>
            </div>
        }),
        regularColumnHelper.accessor('orderSerial', {
            id: 'orderSerial',
            header: t("furpanel.admin.events.badges.print.advanced_mode.regular.columns.serial"),
        }),
        regularColumnHelper.accessor('user.sponsorship', {
            id: 'sponsorship',
            header: t("furpanel.admin.events.badges.print.advanced_mode.regular.columns.sponsorship"),
        })
    ]);

    /* Fursuit badges table */
    const fursuitColumnHelper = createColumnHelper<FursuitBadge>();
    const [fursuitBadgeRows, setFursuitBadgeRows] = useState<FursuitBadge[]>([]);
    const [fursuitColumns] = useState(() => [
        fursuitColumnHelper.accessor('fursuit', {
            id: 'fursuit',
            header: t("furpanel.admin.events.badges.print.advanced_mode.fursuit.columns.sona_name"),
            cell: props => <div className="data horizontal-list flex-vertical-center gap-2mm">
                <UserPicture fursuitData={props.row.original.fursuit} hideEffect></UserPicture>
                <span className="title small">{props.row.original.fursuit.name}</span>
            </div>
        }),
        fursuitColumnHelper.accessor('fursuit.species', {
            id: 'species',
            header: t("furpanel.admin.events.badges.print.advanced_mode.fursuit.columns.species"),
        }),
        fursuitColumnHelper.accessor('orderSerial', {
            id: 'orderSerial',
            header: t("furpanel.admin.events.badges.print.advanced_mode.fursuit.columns.serial"),
        }),
        fursuitColumnHelper.accessor('fursuit.sponsorship', {
            id: 'sponsorship',
            header: t("furpanel.admin.events.badges.print.advanced_mode.fursuit.columns.sponsorship"),
        })
    ]);
    const canPrint: boolean = useMemo(() => (regularBadgeRows && regularBadgeRows.length > 0) ||
        (fursuitBadgeRows && fursuitBadgeRows.length > 0), [regularBadgeRows, fursuitBadgeRows]);

    const runPrint = () => {
        if (!canPrint) return;
        setPrintLoading(true);
        const regularBadgeCodes = regularBadgeRows.map(row => row.user.userId).join(",");
        const fursuitBadgeCodes = fursuitBadgeRows.map(row => row.fursuit.id).join(",");
        const promises: Promise<any>[] = [];
        if (!isEmpty(regularBadgeCodes)) {
            promises.push(runRequest(new GetRenderedCommonBadgesApiAction(), undefined, undefined,
                buildSearchParams({ "userIds": [regularBadgeCodes] })));
        }
        if (!isEmpty(fursuitBadgeCodes)) {
            promises.push(runRequest(new GetRenderedFursuitBadgesApiAction(), undefined, undefined,
                buildSearchParams({ "fursuitIds": [fursuitBadgeCodes] })));
        }
        Promise.all(promises)
            .then(responses => responses.forEach(response => {
                const res = response as Response;
                res.blob().then((badgesBlob) => {
                    const result = URL.createObjectURL(badgesBlob);
                    window.open(result, "_blank");
                    URL.revokeObjectURL(result);
                });
            }))
            .catch((err) => showModal(
                t("common.error"),
                <ModalError error={err} translationRoot="furpanel" translationKey="admin.events.badges.errors" />
            )).finally(() => setPrintLoading(false));
    }

    return <div className="page">
        <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap">
            <Link href={getParentDirectory(getParentDirectory(path))}><Icon icon={"ARROW_BACK"} /></Link>
            <div className="horizontal-list gap-2mm">
                <span className="title medium">{t("furpanel.admin.events.badges.print.advanced_mode.title")}</span>
            </div>
        </div>
        <div className="vertical-list gap-2mm">
            {/* Regular badges */}
            <BadgeTable<RegularBadge, SearchRegularBadgesResponse>
                title={t("furpanel.admin.events.badges.print.advanced_mode.regular.title")}
                rows={regularBadgeRows}
                setRows={setRegularBadgeRows}
                columns={regularColumns}
                searchAction={new SearchRegularBadgesApiAction()}
                getRowId={(row) => "" + row.user.userId}
                getRowsFromResult={(result) => result.userBadges}
                icon={"PERSON_BOOK"} />

            {/* Fursuit badges */}
            <BadgeTable<FursuitBadge, SearchFursuitBadgesResponse>
                title={t("furpanel.admin.events.badges.print.advanced_mode.fursuit.title")}
                rows={fursuitBadgeRows}
                setRows={setFursuitBadgeRows}
                columns={fursuitColumns}
                searchAction={new SearchFursuitBadgesApiAction()}
                getRowId={(row) => "" + row.fursuit.id}
                getRowsFromResult={(result) => result.fursuitBadges}
                icon={"PETS"} />
            <div className="horizontal-list">
                <div className="spacer"></div>
                <Button iconName={"PRINT"} disabled={!canPrint} busy={printLoading} onClick={runPrint}>
                    {t("furpanel.admin.events.badges.print.advanced_mode.print")}
                </Button>
            </div>
        </div>
    </div>
}