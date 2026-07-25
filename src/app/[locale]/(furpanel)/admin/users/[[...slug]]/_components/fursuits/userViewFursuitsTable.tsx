import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import FpButton from "@/components/input/fpButton";
import Modal from "@/components/modal";
import FpTable from "@/components/table/fpTable";
import UserPicture from "@/components/userPicture";
import { GetUserAdminViewResponse } from "@/lib/api/admin/userView";
import { DeleteFursuitApiAction } from "@/lib/api/badge/fursuits";
import { FursuitEventData } from "@/lib/api/badge/types";
import { ApiErrorResponse } from "@/lib/api/networking";
import { runRequest } from "@/lib/api/networking/main";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import AddFursuitModal from "./addFursuitModal";

export default function UserViewFursuitsTable({
  userData,
  reloadData,
}: Readonly<{
  userData: GetUserAdminViewResponse;
  reloadData: () => void;
}>) {
  const t = useTranslations();
  const { showModal } = useModalUpdate();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [delModalOpen, setDelModalOpen] = useState(false);
  const [fursuit, setFursuit] = useState<FursuitEventData>();

  const promptEditFursuit = (f: FursuitEventData) => {
    setDelModalOpen(false);
    setFursuit(f);
    setAddModalOpen(true);
  };

  const closeEditFursuit = () => {
    setFursuit(undefined);
    setAddModalOpen(false);
  };

  const promptAddFursuit = () => {
    setDelModalOpen(false);
    setFursuit(undefined);
    setAddModalOpen(true);
  };

  const promptDeleteFursuit = (f: FursuitEventData) => {
    setAddModalOpen(false);
    setFursuit(f);
    setDelModalOpen(true);
  };

  const closeDeleteFursuit = () => {
    setFursuit(undefined);
    setDelModalOpen(false);
  };

  const deleteFursuit = () => {
    setDeleteLoading(true);
    runRequest({
      action: new DeleteFursuitApiAction(),
      pathParams: { id: fursuit?.fursuit.id },
    })
      .catch((err) => showModal(t("common.error"), <ErrorMessage error={err as ApiErrorResponse} />))
      .finally(() => {
        closeDeleteFursuit();
        setDeleteLoading(false);
        reloadData();
      });
  };

  const fursuitColHelper = createColumnHelper<FursuitEventData>();
  const fursuitColumns: ColumnDef<FursuitEventData, any>[] = useMemo(
    () => [
      fursuitColHelper.display({
        id: "propic",
        header: t("furpanel.admin.users.accounts.view.fursuit_table.picture"),
        cell: (props) => (
          <UserPicture key={props.row.original.fursuit.id} size={120} fursuitData={props.row.original.fursuit} />
        ),
      }),
      fursuitColHelper.accessor("fursuit.name", {
        id: "fursuitName",
        header: t("furpanel.admin.users.accounts.view.fursuit_table.name"),
      }),
      fursuitColHelper.accessor("fursuit.species", {
        id: "fursuitSpecies",
        header: t("furpanel.admin.users.accounts.view.fursuit_table.species"),
      }),
      fursuitColHelper.accessor("fursuit.id", {
        id: "fursuitId",
        header: t("furpanel.admin.users.accounts.view.fursuit_table.id"),
      }),
      fursuitColHelper.display({
        id: "actions",
        header: "",
        enableResizing: false,
        maxSize: 90,
        cell: (props) => (
          <div className="horizontal-list gap-2mm">
            <FpButton icon="EDIT_SQUARE" onClick={() => promptEditFursuit(props.row.original)} />
            <FpButton icon="DELETE" onClick={() => promptDeleteFursuit(props.row.original)} />
          </div>
        ),
      }),
    ],
    [deleteLoading]
  );

  return (
    <>
      <FpTable<FursuitEventData>
        rows={userData?.badgeData.fursuits}
        columns={fursuitColumns}
        enableSearch
        pinnedColumns={{ right: ["actions"] }}
        showAddButton
        onAdd={promptAddFursuit}
      />
      <AddFursuitModal
        fursuit={fursuit}
        open={addModalOpen}
        onClose={closeEditFursuit}
        reloadData={reloadData}
        userId={userData.personalInfo.userId!}
      />
      <Modal
        open={delModalOpen}
        onClose={closeDeleteFursuit}
        title={t("furpanel.badge.messages.confirm_fursuit_deletion.title", { name: fursuit?.fursuit.name ?? "" })}
        busy={deleteLoading}
      >
        <span>
          {t("furpanel.badge.messages.confirm_fursuit_deletion.description", { name: fursuit?.fursuit.name ?? "" })}
        </span>
        <div className="horizontal-list gap-4mm">
          <FpButton className="danger" icon="CANCEL" busy={deleteLoading} onClick={closeDeleteFursuit}>
            {t("common.cancel")}
          </FpButton>
          <div className="spacer"></div>
          <FpButton className="success" icon="CHECK" busy={deleteLoading} onClick={deleteFursuit}>
            {t("common.confirm")}
          </FpButton>
        </div>
      </Modal>
    </>
  );
}
