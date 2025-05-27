import { ICONS } from "@/components/icon";
import Button from "@/components/input/button";
import FpTable from "@/components/table/fpTable";
import UserPicture from "@/components/userPicture";
import { GetUserAdminViewResponse } from "@/lib/api/admin/userView";
import { DeleteFursuitApiAction, Fursuit } from "@/lib/api/badge/fursuits";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import AddFursuitModal from "./addFursuitModal";
import { runRequest } from "@/lib/api/global";
import { useModalUpdate } from "@/components/context/modalProvider";
import ModalError from "@/components/modalError";
import Modal from "@/components/modal";

export default function UserViewFursuitsTable({
    userData,
    reloadData
}: Readonly<{
    userData: GetUserAdminViewResponse,
    reloadData: () => void
}>) {
    const t = useTranslations();
    const {showModal} = useModalUpdate();
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [delModalOpen, setDelModalOpen] = useState(false);
    const [fursuit, setFursuit] = useState<Fursuit>();

    const promptEditFursuit = (f: Fursuit) => {
        setDelModalOpen(false);
        setFursuit(f);
        setAddModalOpen(true);
    }

    const closeEditFursuit = () => {
        setFursuit(undefined);
        setAddModalOpen(false);
    }

    const promptAddFursuit = () => {
        setDelModalOpen(false);
        setFursuit(undefined);
        setAddModalOpen(true);
    }

    const promptDeleteFursuit = (f: Fursuit) => {
        setAddModalOpen(false);
        setFursuit(f);
        setDelModalOpen(true);
    }

    const closeDeleteFursuit = () => {
        setFursuit(undefined);
        setDelModalOpen(false);
    }

    const deleteFursuit = () => {
        setDeleteLoading(true);
        runRequest(new DeleteFursuitApiAction(),
            [String(fursuit?.fursuit.id)])
        .catch((err) => {
            showModal(
                t("common.error"),
                <ModalError error={err} translationRoot="furpanel" translationKey="badge.errors"/>);
        }).finally(() => {
            closeDeleteFursuit();
            setDeleteLoading(false);
            reloadData();
        })
    }

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
                <Button iconName={ICONS.EDIT_SQUARE}
                    onClick={()=>promptEditFursuit(props.row.original)}/>
                <Button iconName={ICONS.DELETE}
                    onClick={()=>promptDeleteFursuit(props.row.original)}/>
            </div>
        })
    ], [deleteLoading]);

    return <>
        <FpTable<Fursuit> rows={userData?.badgeData.fursuits}
            columns={fursuitColumns}
            enableSearch
            pinnedColumns={{right: ["actions"]}}
            showAddButton
            onAdd={promptAddFursuit}/>
        <AddFursuitModal fursuit={fursuit}
            open={addModalOpen}
            onClose={closeEditFursuit}
            reloadData={reloadData}
            userId={userData.personalInfo.userId!}/>
        <Modal open={delModalOpen} onClose={closeDeleteFursuit}
            title={t("furpanel.badge.messages.confirm_fursuit_deletion.title", { name: fursuit?.fursuit.name })} busy={deleteLoading}>
            <span>{t("furpanel.badge.messages.confirm_fursuit_deletion.description", { name: fursuit?.fursuit.name })}</span>
            <div className="horizontal-list gap-4mm">
            <Button className="danger" iconName={ICONS.CANCEL} busy={deleteLoading} onClick={closeDeleteFursuit}>
                {t("common.cancel")}</Button>
            <div className="spacer"></div>
            <Button className="success" iconName={ICONS.CHECK} busy={deleteLoading} onClick={deleteFursuit}>
                {t("common.confirm")}</Button>
            </div>
        </Modal>
    </>;
}