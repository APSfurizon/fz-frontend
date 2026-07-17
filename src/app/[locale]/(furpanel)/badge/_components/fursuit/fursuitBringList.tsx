import { useModalUpdate } from "@/components/context/modalProvider";
import ErrorMessage from "@/components/errorMessage";
import Icon from "@/components/icon";
import FpButton from "@/components/input/fpButton";
import Modal from "@/components/modal";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { BringFursuitToEventApiAction } from "@/lib/api/badge/fursuits";
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

  const shouldShowBanner = useMemo(
    () =>
      badgeData &&
      !isEditExpired &&
      badgeData.canBringFursuitsToEvent &&
      badgeData.fursuits.filter((f) => f.bringingToEvent).length == 0,
    [badgeData, isEditExpired]
  );

  const filteredFursuits = useMemo(
    () => (badgeData?.fursuits || []).filter((f) => f.bringingToEvent),
    [badgeData?.fursuits]
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
    const currentSelectedFursuits = new Set(
      badgeData?.fursuits.filter((f) => f.bringingToEvent).map((f) => f.fursuit.id)
    );
    const fursuitsToDeSelect = currentSelectedFursuits.difference(fursuitIds);
    const fursuitsToSelect = fursuitIds.difference(currentSelectedFursuits);
    const createRequest = (id: number, bring: boolean) =>
      runRequest({
        action: new BringFursuitToEventApiAction(),
        pathParams: { id: id },
        body: {
          bringFursuitToCurrentEvent: bring,
        },
      });
    const endpointsToRun = [...fursuitsToDeSelect].map((id) => createRequest(id, false));
    endpointsToRun.push(...[...fursuitsToSelect].map((id) => createRequest(id, true)));
    setSelectLoading(true);

    Promise.all(endpointsToRun)
      .then(() => {
        closeAllFursuitsModal();
        refresh();
      })
      .catch((e) => showModal(t("common.error"), <ErrorMessage error={e as ApiErrorResponse} />))
      .finally(() => setSelectLoading(false));
  };

  return (
    <>
      <div className="fursuit-section rounded-m vertical-list gap-2mm">
        {/* Banner */}
        {shouldShowBanner && (
          <NoticeBox theme={NoticeTheme.Warning} title={t("furpanel.badge.messages.fursuit_banner.title")}>
            {t.rich("furpanel.badge.messages.fursuit_banner.description", {
              eventName: EVENT_NAME,
              b: (chunks) => <b className="highlight">{chunks}</b>,
            })}
          </NoticeBox>
        )}
        <div className="fursuit-header rounded-s horizontal-list align-items-center gap-2mm flex-wrap">
          <Icon icon="PETS" />
          <span className="title average">
            {t("furpanel.badge.your_fursuits_for_event", { amount: filteredFursuits.length, eventName: EVENT_NAME })}
          </span>
          <div className="spacer"></div>
          <FpButton
            icon="SELECT_CHECK_BOX"
            title={t("common.CRUD.select")}
            busy={selectLoading}
            onClick={openSelectFursuitsModal}
          >
            {t("common.CRUD.select")}
          </FpButton>
          <FpButton icon="APPS" title={t("furpanel.badge.all_your_fursuits")} onClick={openAllFursuitsModal}>
            {t("furpanel.badge.all_your_fursuits")}
          </FpButton>
        </div>
        <div className="fursuit-container flex-wrap gap-2mm ">
          {/* Fursuit badge rendering */}
          {filteredFursuits.map((fursuitData: FursuitEventData, index: number) => (
            <FursuitCard key={index} fursuitEventData={fursuitData} />
          ))}
        </div>
        <NoticeBox theme={NoticeTheme.FAQ} title={t("furpanel.badge.messages.fursuit_badge.title")}>
          {t.rich("furpanel.badge.messages.fursuit_badge.description", {
            eventName: EVENT_NAME,
            maxFursuits: badgeData?.maxFursuits ?? 0,
            b: (chunks) => <b className="highlight">{chunks}</b>,
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
