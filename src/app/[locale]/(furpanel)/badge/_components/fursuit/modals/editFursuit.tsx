import Checkbox from "@/components/input/checkbox";
import DataForm from "@/components/input/dataForm";
import FpButton from "@/components/input/fpButton";
import FpInput from "@/components/input/fpInput";
import Upload from "@/components/input/upload";
import { AddFursuitFormAction, EditFursuitFormAction } from "@/lib/api/badge/fursuits";
import { FursuitEventData } from "@/lib/api/badge/types";
import { ApiErrorResponse } from "@/lib/api/networking";
import { EVENT_NAME } from "@/lib/constants";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useBadge } from "../../badgeProvider";

type EditFursuitProps = {
  editMode: boolean;
  currentFursuit?: FursuitEventData;
  onError(e: ApiErrorResponse): void;
  onSuccess(): void;
  onAbort(): void;
};

export default function EditFursuit(props: Readonly<EditFursuitProps>) {
  const t = useTranslations();
  const { badgeData } = useBadge();

  const [loading, setLoading] = useState(false);

  const [fursuitBlob, setFursuitBlob] = useState<Blob>();
  const [deleteFursuitImage, setDeleteFursuitImage] = useState(false);

  const removeCurrentImage = () => {
    setDeleteFursuitImage(props.editMode);
    setFursuitBlob(undefined);
  };

  const editFursuitFormData = (e: FormData): FormData => {
    e.append("image", fursuitBlob ?? "");
    if (props.editMode) {
      e.append("delete-image", "" + (deleteFursuitImage && !fursuitBlob));
    }
    return e;
  };

  return (
    <DataForm
      action={props.editMode ? new EditFursuitFormAction() : new AddFursuitFormAction()}
      pathParams={props.editMode ? { id: props.currentFursuit?.fursuit.id } : undefined}
      editFormData={editFursuitFormData}
      hideSave
      className="gap-2mm"
      onFail={props.onError}
      onSuccess={props.onSuccess}
      resetOnSuccess
      setBusy={setLoading}
      busy={loading}
    >
      <Upload
        initialMedia={
          props.editMode ? (deleteFursuitImage ? undefined : props.currentFursuit?.fursuit.propic) : undefined
        }
        requireCrop
        setBlob={setFursuitBlob}
        onDelete={removeCurrentImage}
        label={t("furpanel.badge.input.fursuit_image.label")}
        helpText={t("furpanel.badge.input.fursuit_image.help")}
      />
      <FpInput
        inputType="text"
        fieldName="name"
        required
        initialValue={props.editMode ? props.currentFursuit?.fursuit.name : ""}
        label={t("furpanel.badge.input.fursuit_name.label")}
        placeholder={t("furpanel.badge.input.fursuit_name.placeholder")}
      />
      <FpInput
        inputType="text"
        fieldName="species"
        initialValue={props.editMode ? props.currentFursuit?.fursuit.species : ""}
        label={t("furpanel.badge.input.fursuit_species.label")}
        placeholder={t("furpanel.badge.input.fursuit_species.placeholder")}
      />
      <Checkbox
        fieldName="bring-to-current-event"
        disabled={
          (!(props.editMode && props.currentFursuit?.bringingToEvent) && !badgeData?.canBringFursuitsToEvent) ||
          !badgeData?.allowEditBringFursuitToEvent
        }
        initialValue={props.editMode ? props.currentFursuit?.bringingToEvent : false}
      >
        {t("furpanel.badge.input.bring_to_event.label", { eventName: EVENT_NAME })}
      </Checkbox>
      <Checkbox
        fieldName="show-in-fursuit-count"
        initialValue={props.editMode ? props.currentFursuit?.showInFursuitCount : true}
      >
        {t("furpanel.badge.input.show_in_fursuit_count.label", { eventName: EVENT_NAME })}
      </Checkbox>
      <Checkbox fieldName="show-owner" initialValue={props.editMode ? props.currentFursuit?.showOwner : true}>
        {t("furpanel.badge.input.show_owner.label", { eventName: EVENT_NAME })}
      </Checkbox>
      <div className="horizontal-list gap-4mm margin-top-2mm">
        <FpButton type="button" className="danger" icon="CANCEL" busy={loading} onClick={props.onAbort}>
          {t("common.cancel")}
        </FpButton>
        <div className="spacer"></div>
        <FpButton type="submit" className="success" icon="CHECK" busy={loading}>
          {t("common.confirm")}
        </FpButton>
      </div>
    </DataForm>
  );
}
