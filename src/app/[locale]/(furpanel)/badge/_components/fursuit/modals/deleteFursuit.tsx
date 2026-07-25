import FpButton from "@/components/input/fpButton";
import Modal from "@/components/modal";
import { DeleteFursuitApiAction } from "@/lib/api/badge/fursuits";
import { FursuitEventData } from "@/lib/api/badge/types";
import { ApiErrorResponse, runRequest } from "@/lib/api/networking";
import { useTranslations } from "next-intl";
import { useState } from "react";

type DeleteFursuitProps = {
  currentFursuit: FursuitEventData | undefined;
  open: boolean;
  onClose(): void;
  onSuccess(): void;
  onError(e: ApiErrorResponse): void;
};

export default function DeleteFursuit(props: Readonly<DeleteFursuitProps>) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const deleteFursuit = () => {
    if (!props.currentFursuit) {
      props.onClose();
      return;
    }
    setLoading(true);
    runRequest({
      action: new DeleteFursuitApiAction(),
      pathParams: { id: props.currentFursuit.fursuit.id },
    })
      .then(props.onSuccess)
      .catch(props.onError)
      .finally(() => {
        props.onClose();
        setLoading(false);
      });
  };

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title={t("furpanel.badge.messages.confirm_fursuit_deletion.title", {
        name: props.currentFursuit?.fursuit.name ?? "",
      })}
      busy={loading}
    >
      <span>
        {t("furpanel.badge.messages.confirm_fursuit_deletion.description", {
          name: props.currentFursuit?.fursuit.name ?? "",
        })}
      </span>
      <div className="horizontal-list gap-4mm">
        <FpButton className="danger" icon="CANCEL" busy={loading} onClick={props.onClose}>
          {t("common.cancel")}
        </FpButton>
        <div className="spacer"></div>
        <FpButton className="success" icon="CHECK" busy={loading} onClick={deleteFursuit}>
          {t("common.confirm")}
        </FpButton>
      </div>
    </Modal>
  );
}
