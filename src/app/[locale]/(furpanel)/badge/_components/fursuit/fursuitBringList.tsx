import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import Icon from "@/components/icon";
import FpButton from "@/components/input/fpButton";
import Modal from "@/components/modal";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { MultipleBringFursuitToEventApiAction } from "@/lib/api/badge/fursuits";
import { FursuitEventData } from "@/lib/api/badge/types";
import { ApiErrorResponse, runRequest } from "@/lib/api/networking";
import { EVENT_NAME } from "@/lib/constants";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useBadge } from "../badgeProvider";
import FursuitCard from "./fursuitCard";
import FursuitList from "./fursuitList";
import SelectFursuitModal from "./modals/selectFursuit";

export default function FursuitBringList() {
  const t = useTranslations();
  const { badgeData, isEditExpired, refresh } = useBadge();
  const { showModal } = useModalUpdate();
  const [selectLoading, setSelectLoading] = useState(false);

  const canChangeBringingStatus = badgeData && badgeData.fursuits.allowEditBringFursuitToEvent;

  const filteredFursuits = useMemo(
    () => (badgeData?.fursuits.fursuits || []).filter((f) => f.bringingToEvent),
    [badgeData?.fursuits.fursuits]
  );

  // All fursuits
  const [allFursuitsModalOpen, setAllFursuitsModalOpen] = useState(false);

  const openAllFursuitsModal = () => {
    setAllFursuitsModalOpen(true);
  };

  const closeAllFursuitsModal = () => {
    setAllFursuitsModalOpen(false);
  };

  // Select fursuits
  const [selectFursuitsModalOpen, setSelectFursuitsModalOpen] = useState(false);

  const openSelectFursuitsModal = () => {
    setSelectFursuitsModalOpen(true);
  };

  const closeSelectFursuitsModal = () => {
    setSelectFursuitsModalOpen(false);
  };

  const confirmSelectFursuitsModal = (fursuitIds: Set<number>) => {
    const fursuitBringingObject: Record<number, boolean> = Object.fromEntries(
      badgeData?.fursuits.fursuits.map((f) => [f.fursuit.id, fursuitIds.has(f.fursuit.id)]) || []
    );

    setSelectLoading(true);

    runRequest({
      action: new MultipleBringFursuitToEventApiAction(),
      body: {
        fursuitBroughtToEventMap: fursuitBringingObject,
      },
    })
      .then((results) => {
        if (results) {
          refresh();
        }
        closeSelectFursuitsModal();
      })
      .catch((e) => showModal(t("common.error"), <ErrorMessage error={e as ApiErrorResponse} />))
      .finally(() => setSelectLoading(false));
  };

  return (
    <>
      <div className="fursuit-section rounded-m vertical-list gap-2mm">
        <div className="fursuit-header rounded-s horizontal-list align-items-center gap-2mm flex-wrap">
          <Icon icon="PETS" />
          <span className="title average">
            {t("furpanel.badge.your_fursuits_for_event", { amount: filteredFursuits.length, eventName: EVENT_NAME })}
          </span>
          <div className="spacer"></div>
          {filteredFursuits.length > 0 && canChangeBringingStatus && (
            <FpButton
              icon="SELECT_CHECK_BOX"
              title={t("furpanel.badge.actions.select_fursuit")}
              busy={selectLoading}
              onClick={openSelectFursuitsModal}
            >
              {t("furpanel.badge.actions.select_fursuit")}
            </FpButton>
          )}
          <FpButton icon="APPS" title={t("furpanel.badge.all_your_fursuits")} onClick={openAllFursuitsModal}>
            {t("furpanel.badge.all_your_fursuits")}
          </FpButton>
        </div>
        {filteredFursuits.length == 0 && canChangeBringingStatus && (
          <div className="horizontal-list spacer">
            <div className="spacer"></div>
            <FpButton
              title={t("furpanel.badge.actions.select_fursuit")}
              icon="SELECT_CHECK_BOX"
              iconClass="x-large margin-left-2mm"
              busy={selectLoading}
              onClick={openSelectFursuitsModal}
            >
              <div className="padding-2mm title x-large">{t("furpanel.badge.actions.select_fursuit")}</div>
            </FpButton>
            <div className="spacer"></div>
          </div>
        )}
        <div className="fursuit-container flex-wrap gap-2mm ">
          {/* Fursuit badge rendering */}
          {filteredFursuits.map((fursuitData: FursuitEventData, index: number) => (
            <FursuitCard key={index} fursuitEventData={fursuitData} />
          ))}
        </div>
        <NoticeBox theme={NoticeTheme.FAQ} title={t("furpanel.badge.messages.fursuit_badge.title")}>
          {t.rich("furpanel.badge.messages.fursuit_badge.description", {
            eventName: EVENT_NAME,
            maxFursuitsBroughtToEvent: badgeData?.fursuits.maxFursuitsBroughtToEvent ?? 0,
            b: (chunks) => <b className="highlight">{chunks}</b>,
            br: () => <br />,
          })}
        </NoticeBox>
      </div>
      {/* All fursuit management */}
      <Modal open={allFursuitsModalOpen} onClose={closeAllFursuitsModal}>
        <FursuitList />
      </Modal>
      <SelectFursuitModal
        open={selectFursuitsModalOpen}
        loading={selectLoading}
        onClose={closeSelectFursuitsModal}
        onConfirm={confirmSelectFursuitsModal}
      />
    </>
  );
}
