import Icon from "@/components/icon";
import FpButton from "@/components/input/fpButton";
import { FursuitEventData } from "@/lib/api/badge/types";
import { EMPTY_PROFILE_PICTURE_SRC, EVENT_NAME } from "@/lib/constants";
import { cssClass, getImageUrl } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { MouseEvent } from "react";
import { useBadge } from "../badgeProvider";

type FursuitCardProps = {
  fursuitEventData: FursuitEventData;
  onEditClick?(fursuit: FursuitEventData): void;
  onDeleteClick?(fursuit: FursuitEventData): void;
  onClick?(e: MouseEvent<HTMLDivElement>, fursuit: FursuitEventData): void;
  selected?: boolean;
};
export default function FursuitCard(props: Readonly<FursuitCardProps>) {
  const t = useTranslations();
  const { badgeData } = useBadge();
  return (
    <div
      className={
        "fursuit gap-2mm rounded-l " +
        cssClass({
          "fursuit--selected": !!props.selected,
          "fursuit--selectable": !!props.onClick,
        })
      }
      onClick={(e) => props.onClick?.(e, props.fursuitEventData)}
    >
      <div className="main-data gap-2mm">
        <Image
          unoptimized
          className="fursuit-image rounded-s"
          width={500}
          height={500}
          alt=""
          quality={100}
          src={getImageUrl(props.fursuitEventData.fursuit.propic?.mediaUrl) ?? EMPTY_PROFILE_PICTURE_SRC}
        ></Image>
        <div className="details vertical-list gap-2mm">
          <div className="vertical-list">
            <span className="title average bold">{props.fursuitEventData.fursuit.name}</span>
            <span className="title small color-subtitle">{props.fursuitEventData.fursuit.species}</span>
            <hr></hr>
          </div>
          <div className="vertical-list gap-2mm">
            {props.fursuitEventData.bringingToEvent && (
              <span className="title tiny">
                <Icon className="average" icon="CHECK_CIRCLE" />
                {t("furpanel.badge.input.bring_to_event.label", { eventName: EVENT_NAME })}
              </span>
            )}
            {props.fursuitEventData.showInFursuitCount && (
              <span className="title tiny">
                <Icon className="average" icon="CHECK_CIRCLE" />
                {t("furpanel.badge.input.show_in_fursuit_count.label", { eventName: EVENT_NAME })}
              </span>
            )}
            {props.fursuitEventData.showOwner && (
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
        {props.onDeleteClick && (
          <FpButton
            className="danger"
            icon="DELETE"
            onClick={() => props.onDeleteClick?.(props.fursuitEventData)}
            title={t("furpanel.badge.messages.confirm_fursuit_deletion.title", {
              name: props.fursuitEventData.fursuit.name,
            })}
            disabled={!badgeData?.allowedModifications}
          >
            {t("common.CRUD.delete")}
          </FpButton>
        )}
        <div className="spacer"></div>
        {props.onEditClick && (
          <FpButton
            icon="EDIT_SQUARE"
            onClick={() => props.onEditClick?.(props.fursuitEventData)}
            title={t("furpanel.badge.actions.edit_fursuit", { name: props.fursuitEventData.fursuit.name })}
            disabled={!badgeData?.allowedModifications}
          >
            {t("common.CRUD.edit")}
          </FpButton>
        )}
      </div>
    </div>
  );
}
