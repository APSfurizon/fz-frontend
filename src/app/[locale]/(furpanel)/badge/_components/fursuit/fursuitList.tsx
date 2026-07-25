import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import Icon from "@/components/icon";
import FpButton from "@/components/input/fpButton";
import Modal from "@/components/modal";
import { FursuitEventData } from "@/lib/api/badge/types";
import { ApiErrorResponse } from "@/lib/api/networking";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useBadge } from "../badgeProvider";
import FursuitCard from "./fursuitCard";
import DeleteFursuit from "./modals/deleteFursuit";
import EditFursuit from "./modals/editFursuit";

export default function FursuitList() {
  const t = useTranslations();
  const { badgeData, refresh } = useBadge();
  const { showModal } = useModalUpdate();

  // Editing

  const [editMode, setEditMode] = useState(false);
  const [currentFursuit, setCurrentFursuit] = useState<FursuitEventData>();
  const [editFursuitModalOpen, setEditFursuitModalOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const promptAddFursuit = () => {
    setEditFursuitModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const promptEditFursuit = (f: FursuitEventData) => {
    setEditMode(true);
    setCurrentFursuit(f);
    setEditFursuitModalOpen(true);
  };

  const closeEditFursuitModal = () => {
    setEditFursuitModalOpen(false);
    setEditMode(false);
    setCurrentFursuit(undefined);
  };

  const onEditFursuitSuccess = () => {
    closeEditFursuitModal();
    refresh();
  };

  const onEditFursuitError = (e: ApiErrorResponse) => {
    closeEditFursuitModal();
    showModal(t("common.error"), <ErrorMessage error={e} />, "ERROR");
  };

  // Deletion
  const [deleteFursuitModalOpen, setDeleteFursuitModalOpen] = useState(false);

  const promptDeleteFursuit = (f: FursuitEventData) => {
    setCurrentFursuit(f);
    setDeleteFursuitModalOpen(true);
  };

  const closeDeleteFursuitModal = () => {
    setCurrentFursuit(undefined);
    setDeleteFursuitModalOpen(false);
  };

  const onDeleteFursuitSuccess = () => {
    closeDeleteFursuitModal();
    refresh();
  };

  const onDeleteFursuitError = (e: ApiErrorResponse) => {
    closeDeleteFursuitModal();
    showModal(t("common.error"), <ErrorMessage error={e} />, "ERROR");
  };

  return (
    <>
      <div className="fursuit-section rounded-m vertical-list gap-2mm">
        <div className="fursuit-header rounded-s horizontal-list align-items-center gap-2mm flex-wrap">
          <Icon icon="PETS" />
          <span className="title average">
            {t("furpanel.badge.your_fursuits", { amount: badgeData?.fursuits.length ?? 0 })}
          </span>
          <div className="spacer"></div>
          <FpButton icon="ADD_CIRCLE" title={t("common.CRUD.add")} onClick={promptAddFursuit}>
            {t("common.CRUD.add")}
          </FpButton>
        </div>
      </div>
      <div className="fursuit-container flex-wrap gap-2mm ">
        {/* Fursuit badge rendering */}
        {badgeData?.fursuits.map((fursuitData: FursuitEventData, index: number) => (
          <FursuitCard
            key={index}
            fursuitEventData={fursuitData}
            onEditClick={promptEditFursuit}
            onDeleteClick={promptDeleteFursuit}
          />
        ))}
      </div>
      <Modal
        title={
          editMode
            ? t("furpanel.badge.actions.edit_fursuit", { name: currentFursuit?.fursuit.name ?? "" })
            : t("furpanel.badge.actions.add_fursuit")
        }
        open={editFursuitModalOpen}
        onClose={closeEditFursuitModal}
      >
        {editFursuitModalOpen && (
          <EditFursuit
            currentFursuit={currentFursuit}
            editMode={editMode}
            onSuccess={onEditFursuitSuccess}
            onAbort={closeEditFursuitModal}
            onError={onEditFursuitError}
          />
        )}
      </Modal>
      <DeleteFursuit
        currentFursuit={currentFursuit}
        open={deleteFursuitModalOpen}
        onClose={closeDeleteFursuitModal}
        onError={onDeleteFursuitError}
        onSuccess={onDeleteFursuitSuccess}
      />
    </>
  );
}
