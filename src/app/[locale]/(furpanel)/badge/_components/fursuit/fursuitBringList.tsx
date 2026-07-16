import Icon from "@/components/icon";
import FpButton from "@/components/input/fpButton";
import NoticeBox, { NoticeTheme } from "@/components/noticeBox";
import { Fursuit } from "@/lib/api/badge/fursuits";
import { EMPTY_PROFILE_PICTURE_SRC, EVENT_NAME } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useBadge } from "../badgeProvider";

export default function FursuitBringList() {
  const t = useTranslations();
  const [loading] = useState(false);
  const { badgeData, isEditExpired } = useBadge();

  const shouldShowBanner = useMemo(
    () =>
      badgeData &&
      !isEditExpired &&
      badgeData.canBringFursuitsToEvent &&
      badgeData.fursuits.filter((f) => f.bringingToEvent).length == 0,
    [badgeData, isEditExpired]
  );

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
            {t("furpanel.badge.your_fursuits", { amount: badgeData?.fursuits.length ?? 0 })}
          </span>
          {loading && <Icon icon="PROGRESS_ACTIVITY" className="loading-animation" />}
          <div className="spacer"></div>
          <FpButton icon="ADD_CIRCLE" title={t("common.CRUD.add")} onClick={promptAddFursuit}>
            {t("common.CRUD.add")}
          </FpButton>
        </div>
        <div className="fursuit-container flex-wrap gap-2mm ">
          {/* Fursuit badge rendering */}
          {badgeData?.fursuits.map((fursuitData: Fursuit, index: number) => (
            <div key={index} className="fursuit gap-2mm rounded-l">
              <div className="main-data gap-2mm">
                <Image
                  unoptimized
                  className="fursuit-image rounded-s"
                  width={500}
                  height={500}
                  alt=""
                  quality={100}
                  src={getImageUrl(fursuitData.fursuit.propic?.mediaUrl) ?? EMPTY_PROFILE_PICTURE_SRC}
                ></Image>
                <div className="details vertical-list gap-2mm">
                  <div className="vertical-list">
                    <span className="title average bold">{fursuitData.fursuit.name}</span>
                    <span className="title small color-subtitle">{fursuitData.fursuit.species}</span>
                    <hr></hr>
                  </div>
                  <div className="vertical-list gap-2mm">
                    {fursuitData.bringingToEvent && (
                      <span className="title tiny">
                        <Icon className="average" icon="CHECK_CIRCLE" />
                        {t("furpanel.badge.input.bring_to_event.label", { eventName: EVENT_NAME })}
                      </span>
                    )}
                    {fursuitData.showInFursuitCount && (
                      <span className="title tiny">
                        <Icon className="average" icon="CHECK_CIRCLE" />
                        {t("furpanel.badge.input.show_in_fursuit_count.label", { eventName: EVENT_NAME })}
                      </span>
                    )}
                    {fursuitData.showOwner && (
                      <span className="title tiny">
                        <Icon className="average" icon="CHECK_CIRCLE" />
                        {t("furpanel.badge.input.show_owner.label", { eventName: EVENT_NAME })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="spacer"></div>
              <div className="fursuit-actions gap-2mm">
                <FpButton
                  className="danger"
                  icon="DELETE"
                  busy={loading}
                  onClick={() => promptDeleteFursuit(fursuitData)}
                  title={t("furpanel.badge.messages.confirm_fursuit_deletion.title", {
                    name: fursuitData.fursuit.name,
                  })}
                  disabled={!badgeData.allowedModifications}
                >
                  {t("common.CRUD.delete")}
                </FpButton>
                <div className="spacer"></div>
                <FpButton
                  icon="EDIT_SQUARE"
                  onClick={() => promptEditFursuit(fursuitData)}
                  busy={loading}
                  title={t("furpanel.badge.actions.edit_fursuit", { name: fursuitData.fursuit.name })}
                  disabled={!badgeData.allowedModifications}
                >
                  {t("common.CRUD.edit")}
                </FpButton>
              </div>
            </div>
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
    </>
  );
}
