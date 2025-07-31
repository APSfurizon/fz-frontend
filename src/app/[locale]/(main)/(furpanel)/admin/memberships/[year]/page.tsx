"use client"
import Button from "@/components/input/button";
import Icon from "@/components/icon";
import Modal from "@/components/modal";
import ModalError from "@/components/modalError";
import {
    AddCardFormAction, AutoInputUserAddCardManager, ChangeCardRegisterStatusApiAction,
    ChangeCardRegisterStatusApiData, convertCardlessUser, GetCardsApiAction, GetCardsApiResponse,
    UserCardData
} from "@/lib/api/admin/membershipManager";
import { runRequest } from "@/lib/api/global";
import { useModalUpdate } from "@/components/context/modalProvider";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Dispatch, MouseEvent, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import Checkbox from "@/components/input/checkbox";
import UserPicture from "@/components/userPicture";
//import "@/styles/table.css";
import "@/styles/furpanel/admin/membership.css";
import { copyContent, getParentDirectory, years } from "@/lib/utils";
import FpInput from "@/components/input/fpInput";
import DataForm from "@/components/input/dataForm";
import AutoInput from "@/components/input/autoInput";
import LoadingPanel from "@/components/loadingPanel";
import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import FpTable from "@/components/table/fpTable";

export default function MembershipView({ params }: { params: Promise<{ year: number }> }) {

    const [selectedYear, setSelectedYear] = useState<number>();
    const router = useRouter();
    const path = usePathname();
    const t = useTranslations();
    const { showModal } = useModalUpdate();

    // Logic
    const [loading, setLoading] = useState(false);
    const [cardsData, setCardsData] = useState<GetCardsApiResponse | undefined | null>(null);

    // Ui selectors
    const [hideValid, setHideValid] = useState(false);
    const [showMissing, setShowMissing] = useState(true);
    const [showDuplicate, setShowDuplicate] = useState(true);

    // Mark as registered
    const markAsRegistered = (event: MouseEvent<HTMLButtonElement>,
        checked: boolean, setChecked: Dispatch<SetStateAction<boolean>>,
        setBusy: Dispatch<SetStateAction<boolean>>, cardId: number) => {
        setBusy(true);
        const data: ChangeCardRegisterStatusApiData = {
            membershipCardId: cardId,
            registered: checked
        }
        runRequest(new ChangeCardRegisterStatusApiAction(), undefined, data, undefined)
            .catch((err) => {
                showModal(
                    t("common.error"),
                    <ModalError error={err}
                        translationRoot="furpanel"
                        translationKey="admin.membership_manager.errors"
                    />
                );
                setChecked(!checked);
            })
            .finally(() => setBusy(false));
    };

    // Add card
    const [addModalOpen, setAddModalOpen] = useState(false);

    const addCardSuccess = () => {
        setAddModalOpen(false);
        setCardsData(undefined);
    }

    const addCardFail = (err: any) => {
        setAddModalOpen(false);
        showModal(
            t("common.error"),
            <ModalError error={err}
                translationRoot="furpanel"
                translationKey="admin.membership_manager.errors"
            />
        );
    }

    // Select year
    useEffect(() => {
        params.then((loadedParams) => {
            // Validate year
            if (!loadedParams.year || isNaN(loadedParams.year)) {
                router.replace("" + new Date().getFullYear());
            }
            setSelectedYear(loadedParams.year)
        })
    }, []);

    // Validate year
    useEffect(() => {
        if (!selectedYear || isNaN(selectedYear)) return;
        setCardsData(undefined);
    }, [selectedYear])

    // Load cards
    useEffect(() => {
        if (!selectedYear || isNaN(selectedYear) || cardsData) return;
        setLoading(true);
        runRequest(new GetCardsApiAction(), undefined, undefined, new URLSearchParams({ "year": "" + selectedYear }))
            .then((value) => setCardsData(value))
            .catch((err) => {
                showModal(
                    t("common.error"),
                    <ModalError error={err} translationRoot="furpanel" translationKey="admin.membership_manager.errors">
                    </ModalError>
                );
                setCardsData(null);
            }).finally(() => setLoading(false));
    }, [cardsData])

    // User card table logic
    const tableRef = useRef<HTMLDivElement>(null);

    const columnHelper = createColumnHelper<UserCardData>();

    const rows = useMemo(() => {
        return [...cardsData?.cards ?? [],
        ...(cardsData?.usersAtCurrentEventWithoutCard ?? []).map(wc => convertCardlessUser(wc))
        ].filter(cd => (showDuplicate && cd.duplicate) || (showMissing && !cd.membershipCard) ||
            (!hideValid && cd.membershipCard && !cd.duplicate));
    }, [cardsData, showMissing, showDuplicate, hideValid]);

    const columns: ColumnDef<UserCardData, any>[] = useMemo(() => [
        columnHelper.accessor('user.fursonaName', {
            id: 'user',
            header: t("furpanel.admin.membership_manager.columns.user"),
            cell: props => <div className="data horizontal-list flex-vertical-center gap-2mm">
                <UserPicture userData={props.row.original.user}></UserPicture>
                <span className="title small">{props.row.original.user.fursonaName}</span>
            </div>
        }),
        columnHelper.accessor("user.sponsorship", {
            id: 'sponsorship',
            header: t("furpanel.admin.membership_manager.columns.sponsorship"),
        }),
        columnHelper.accessor(data => `${data.userInfo.lastName} ${data.userInfo.firstName}`, {
            id: 'name',
            header: t("furpanel.admin.membership_manager.columns.name"),
        }),
        columnHelper.accessor('fromOrderCode', {
            id: 'orderCode',
            header: t("furpanel.admin.membership_manager.columns.order_code"),
        }),
        columnHelper.accessor(data => `${(data.membershipCard?.cardNo ?? '').padStart(7, '0')}`, {
            id: 'cardNumber',
            header: t("furpanel.admin.membership_manager.columns.card_number"),
        }),
        columnHelper.display({
            id: 'anomalies',
            header: t("furpanel.admin.membership_manager.columns.anomalies"),
            cell: props => <div className="horizontal-list flex-vertical-center gap-2mm">
                {props.row.original.duplicate && <>
                    <Icon icon={"FILE_COPY"} />
                    <span className="highlight small">
                        {t("furpanel.admin.membership_manager.errors.CARD_DUPLICATE")}
                    </span>
                </>}
                {!props.row.original.membershipCard && <>
                    <Icon icon={"QUESTION_MARK"} />
                    <span className="highlight small">
                        {t("furpanel.admin.membership_manager.errors.CARD_MISSING")}
                    </span>
                </>}
            </div>
        }),
        columnHelper.accessor('membershipCard.registered', {
            id: 'registered',
            header: t("furpanel.admin.membership_manager.columns.registered"),
            cell: props => <>
                {props.row.original.membershipCard
                    ? <Checkbox initialValue={props.row.original.membershipCard.registered}
                        onClick={(event: MouseEvent<HTMLButtonElement>,
                            checked: boolean, setChecked: Dispatch<SetStateAction<boolean>>,
                            setBusy: Dispatch<SetStateAction<boolean>>) => markAsRegistered(event, checked, setChecked, setBusy, props.row.original.membershipCard!.cardId)}>
                        {t("furpanel.admin.membership_manager.table.headers.registered")}
                    </Checkbox>
                    : undefined
                }
            </>
        })
    ], []);

    const hasDetails = () => true;

    const showDetails = (row: Row<UserCardData>) => <>
        <div className="vertical-list flex-wrap" style={{ gap: ".4em", padding: "0.625em", maxWidth: tableRef.current?.clientWidth }}>
            <div className="horizontal-list flex-wrap gap-4mm">
                <FpInput className="hoverable" label={t("authentication.register.form.first_name.label")} readOnly initialValue={row.original.userInfo.firstName} onClick={(e) => copyContent(e.currentTarget)}></FpInput>
                <FpInput className="hoverable" label={t("authentication.register.form.last_name.label")} readOnly initialValue={row.original.userInfo.lastName} onClick={(e) => copyContent(e.currentTarget)}></FpInput>
                <FpInput className="hoverable" label={t("authentication.register.form.sex.label")} readOnly initialValue={row.original.userInfo.sex} onClick={(e) => copyContent(e.currentTarget)}></FpInput>
                <FpInput className="hoverable" label={t("authentication.register.form.email.label")} readOnly initialValue={row.original.email} onClick={(e) => copyContent(e.currentTarget)}></FpInput>
                {row.original.userInfo.fiscalCode &&
                    <FpInput className="hoverable" label={t("authentication.register.form.fiscal_code.label")} readOnly initialValue={row.original.userInfo.fiscalCode} onClick={(e) => copyContent(e.currentTarget)}></FpInput>}
            </div>
            <hr></hr>
            <span className="title small bold">{t("authentication.register.form.section.birth_data")}</span>
            <div className="horizontal-list flex-wrap gap-4mm">
                <FpInput className="hoverable" label={t("authentication.register.form.birth_country.label")} readOnly initialValue={row.original.userInfo.birthCountry} onClick={(e) => copyContent(e.currentTarget)}></FpInput>
                {row.original.userInfo.birthRegion &&
                    <FpInput className="hoverable" label={t("authentication.register.form.birth_region.label")} readOnly initialValue={row.original.userInfo.birthRegion} onClick={(e) => copyContent(e.currentTarget)}></FpInput>}
                <FpInput className="hoverable" label={t("authentication.register.form.birth_city.label")} readOnly initialValue={row.original.userInfo.birthCity} onClick={(e) => copyContent(e.currentTarget)}></FpInput>
                <FpInput className="hoverable" label={t("authentication.register.form.birthday.label")} readOnly initialValue={row.original.userInfo.birthday} onClick={(e) => copyContent(e.currentTarget)}></FpInput>
            </div>
            <hr></hr>
            <span className="title small bold">{t("authentication.register.form.section.residence_data")}</span>
            <div className="horizontal-list flex-wrap gap-4mm">
                <FpInput className="hoverable" label={t("authentication.register.form.residence_country.label")} readOnly initialValue={row.original.userInfo.residenceCountry} onClick={(e) => copyContent(e.currentTarget)}></FpInput>
                {row.original.userInfo.residenceRegion &&
                    <FpInput className="hoverable" label={t("authentication.register.form.residence_region.label")} readOnly initialValue={row.original.userInfo.residenceRegion} onClick={(e) => copyContent(e.currentTarget)}></FpInput>}
                <FpInput className="hoverable" label={t("authentication.register.form.residence_city.label")} readOnly initialValue={row.original.userInfo.residenceCity} onClick={(e) => copyContent(e.currentTarget)}></FpInput>
                <FpInput className="hoverable" label={t("authentication.register.form.residence_zip_code.label")} readOnly initialValue={row.original.userInfo.residenceZipCode} onClick={(e) => copyContent(e.currentTarget)}></FpInput>
                <FpInput className="hoverable" label={t("authentication.register.form.residence_address.label")} readOnly initialValue={row.original.userInfo.residenceAddress} onClick={(e) => copyContent(e.currentTarget)}></FpInput>
                <FpInput className="hoverable" label={t("authentication.register.form.phone_number.label")} readOnly initialValue={(row.original.userInfo.prefixPhoneNumber ?? "") + (row.original.userInfo.phoneNumber ?? "")} onClick={(e) => copyContent(e.currentTarget)}></FpInput>
            </div>
        </div>
    </>

    return <>
        <div className="page">
            <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap">
                <a href={getParentDirectory(getParentDirectory(path))}><Icon icon={"ARROW_BACK"} /></a>
                <div className="horizontal-list gap-2mm">
                    <span className="title medium">{t("furpanel.admin.membership_manager.header", { yearStart: Number(selectedYear) })}</span>
                    <select className="title average" value={selectedYear ?? ""} onChange={(e) => router.push(e.target.value)}>
                        {years.map((o, k) => <option key={k}>{o}</option>)}
                    </select>
                </div>

                <div className="spacer"></div>
                <Button iconName={"REFRESH"} onClick={() => setCardsData(undefined)} debounce={3000}>{t("common.reload")}</Button>
                <Button onClick={() => setAddModalOpen(true)} busy={loading} disabled={!cardsData?.canAddCards} iconName={"ADD"}>{t("furpanel.admin.membership_manager.actions.add")}</Button>
            </div>
            <div className="filter-params rounded-m horizontal-list gap-4mm flex-wrap">
                <Checkbox initialValue={hideValid} onClick={(e, c) => setHideValid(c)}>
                    {t("furpanel.admin.membership_manager.actions.hide_valid")}
                </Checkbox>
                <Checkbox initialValue={showMissing} onClick={(e, c) => setShowMissing(c)}>
                    {t("furpanel.admin.membership_manager.actions.show_missing_cards")}
                </Checkbox>
                <Checkbox initialValue={showDuplicate} onClick={(e, c) => setShowDuplicate(c)}>
                    {t("furpanel.admin.membership_manager.actions.show_extra_cards")}
                </Checkbox>
            </div>

            {loading && <div className="row"><LoadingPanel className="data" /></div>}
            {cardsData && cardsData?.cards &&
                <FpTable<UserCardData> columns={columns} rows={rows} enableSearch hasDetails={hasDetails} getDetails={showDetails}
                    enablePagination pageSize={20} pinnedColumns={{ left: [], right: ['registered'] }} tableElementRef={tableRef} />}
        </div>
        {/* Add card */}
        <Modal icon={"ADD"} title={t("furpanel.admin.membership_manager.actions.add")} open={addModalOpen && (cardsData?.canAddCards ?? false)}
            onClose={() => setAddModalOpen(false)} busy={loading}>
            <DataForm action={new AddCardFormAction} loading={loading} setLoading={setLoading} hideSave className="vertical-list gap-2mm" onSuccess={addCardSuccess} onFail={addCardFail}>
                <AutoInput fieldName="userId" manager={new AutoInputUserAddCardManager} label={t("furpanel.admin.membership_manager.input.user.label")}
                    param={[selectedYear]}></AutoInput>
                <div className="horizontal-list gap-4mm">
                    <Button type="button" className="danger" iconName={"CANCEL"} busy={loading} onClick={() => setAddModalOpen(false)}>
                        {t("common.cancel")}
                    </Button>
                    <div className="spacer"></div>
                    <Button type="submit" className="success" iconName={"CHECK"} busy={loading}>{t("common.confirm")}</Button>
                </div>
            </DataForm>
        </Modal>
    </>;
}