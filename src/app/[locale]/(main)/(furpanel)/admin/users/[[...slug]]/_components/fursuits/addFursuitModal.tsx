import { useModalUpdate } from "@/components/context/modalProvider";
import Button from "@/components/input/button";
import Checkbox from "@/components/input/checkbox";
import DataForm from "@/components/input/dataForm";
import FpInput from "@/components/input/fpInput";
import Upload from "@/components/input/upload";
import Modal from "@/components/modal"
import ModalError from "@/components/modalError";
import { AddFursuitFormAction, EditFursuitFormAction, Fursuit } from "@/lib/api/badge/fursuits"
import { ApiDetailedErrorResponse, ApiErrorResponse } from "@/lib/api/global";
import { EVENT_NAME } from "@/lib/constants";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function AddFursuitModal({
    userId,
    fursuit,
    open,
    onClose,
    reloadData
}: Readonly<{
    userId: number,
    fursuit?: Fursuit,
    open: boolean,
    onClose: () => void,
    reloadData: () => void,
}>) {
    const t = useTranslations();
    const { showModal } = useModalUpdate();
    const editMode = !!fursuit;
    const [loading, setLoading] = useState(false);
    const [deleteImage, setDeleteImage] = useState(false);
    const [image, setImage] = useState<Blob>();

    const editFursuitFormData = (e: FormData): FormData => {
        e.append("image", image ?? '')
        if (editMode) {
            e.append("delete-image", "" + (deleteImage && !image))
        }
        return e;
    }

    const deleteCurrentImage = () => {
        setDeleteImage(editMode);
        setImage(undefined)
    }

    const beforeClose = () => {
        setImage(undefined);
        setDeleteImage(false);
        onClose();
    }

    const onSuccess = () => {
        beforeClose();
        reloadData();
    }

    const onFail = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
        showModal(
            t("common.error"),
            <ModalError error={err} translationRoot="furpanel" translationKey="badge.errors">
            </ModalError>
        )
    }

    return <Modal open={open} onClose={beforeClose}
        title={editMode
            ? t("furpanel.badge.actions.edit_fursuit", { name: fursuit.fursuit.name })
            : t("furpanel.badge.actions.add_fursuit")}
        icon={editMode ? "EDIT" : "ADD_CIRCLE"}
        busy={loading}>
        <DataForm action={editMode ? new EditFursuitFormAction : new AddFursuitFormAction}
            restPathParams={editMode ? ["" + fursuit?.fursuit.id, "update-with-image"] : undefined}
            loading={loading}
            setLoading={setLoading}
            editFormData={editFursuitFormData}
            hideSave
            className="gap-2mm"
            onFail={onFail}
            onSuccess={onSuccess}
            shouldReset={!open}
            resetOnSuccess>
            <input type="hidden" name="user-id" value={String(userId)} />
            <Upload initialMedia={editMode
                ? deleteImage
                    ? undefined
                    : fursuit.fursuit.propic
                : undefined}
                requireCrop
                setBlob={setImage}
                onDelete={deleteCurrentImage}
                label={t("furpanel.badge.input.fursuit_image.label")} />
            <FpInput inputType="text"
                fieldName="name"
                initialValue={editMode ? fursuit?.fursuit.name : ""}
                label={t("furpanel.badge.input.fursuit_name.label")}
                placeholder={t("furpanel.badge.input.fursuit_name.placeholder")} />
            <FpInput inputType="text"
                fieldName="species"
                initialValue={editMode ? fursuit?.fursuit.species : ""}
                label={t("furpanel.badge.input.fursuit_species.label")}
                placeholder={t("furpanel.badge.input.fursuit_species.placeholder")} />
            <Checkbox fieldName="bring-to-current-event"
                initialValue={editMode ? fursuit?.bringingToEvent : false}>
                {t("furpanel.badge.input.bring_to_event.label", { eventName: EVENT_NAME })}
            </Checkbox>
            <Checkbox fieldName="show-in-fursuit-count"
                initialValue={editMode ? fursuit?.showInFursuitCount : true}>
                {t("furpanel.badge.input.show_in_fursuit_count.label", { eventName: EVENT_NAME })}
            </Checkbox>
            <Checkbox fieldName="show-owner"
                initialValue={editMode ? fursuit?.showOwner : true}>
                {t("furpanel.badge.input.show_owner.label", { eventName: EVENT_NAME })}
            </Checkbox>
            <div className="horizontal-list gap-4mm margin-top-2mm">
                <Button type="button" className="danger" iconName={"CANCEL"} busy={loading}
                    onClick={beforeClose}>
                    {t("common.cancel")}
                </Button>
                <div className="spacer"></div>
                <Button type="submit" className="success" iconName={"CHECK"} busy={loading}>
                    {t("common.confirm")}
                </Button>
            </div>
        </DataForm>
    </Modal>
}