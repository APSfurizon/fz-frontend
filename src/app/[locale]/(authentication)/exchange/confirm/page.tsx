"use client"
import Icon from "@/components/icon";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/lib/api/global";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useTitle from "@/components/hooks/useTitle";
import {
  ExchangeStatusApiAction, ExchangeStatusApiResponse, ExchangeUpdateApiAction,
  ExchangeUpdateApiData
} from "@/lib/api/exchange";
import { buildSearchParams } from "@/lib/utils";
import { translate } from "@/lib/translations";
import Button from "@/components/input/button";
import ModalError from "@/components/modalError";
import { useUser } from "@/components/context/userProvider";
import UserPicture from "@/components/userPicture";
import { RoomData } from "@/lib/api/room";
import { UserData } from "@/lib/api/user";
import { Board, calcTicketData } from "@/lib/api/booking";
import "@/styles/authentication/login.css";
import "@/styles/authentication/exchangeConfirm.css";
import LoadingPanel from "@/components/loadingPanel";

export default function ExchangeConfirm() {
  const t = useTranslations();
  const formatter = useFormatter();
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const { userDisplay } = useUser();

  const renderRoom = (userData: UserData, data: RoomData) => {
    return <>
      <span className="title item-title horizontal-list flex-vertical-center gap-2mm">
        <Icon className="large" icon={"PACKAGE_2"}></Icon>
        {t.rich("authentication.transfer_confirm.room.room_title", {
          user: () => <><UserPicture userData={userData} />{userData.fursonaName}</>,
        })}
      </span>
      <div className="horizontal-list item-content flex-vertical-center gap-2mm rounded-m">
        <Icon className="xx-large" icon="BEDROOM_PARENT"/>
        <div className="vertical-list">
          <span className="title horizontal-list flex-vertical-center">
            {translate(data.roomTypeNames, locale)}
          </span>
          <span className="small descriptive color-subtitle">
            {t("furpanel.booking.items.room_capacity", { capacity: data.roomCapacity })}
          </span>
        </div>
      </div>
    </>;
  }

  // Main logic
  const [error, setError] = useState<ApiErrorResponse | ApiDetailedErrorResponse | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [exchangeData, setExchangeData] = useState<ExchangeStatusApiResponse>();

  // Exchange data
  useEffect(() => {
    setLoading(true);
    runRequest(new ExchangeStatusApiAction(), undefined, undefined,
      buildSearchParams({ "id": params.get("id") ?? "" }))
      .then((result) => setExchangeData(result))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // Exchange confirm
  const updateExchangeStatus = (confirm: boolean) => {
    const data: ExchangeUpdateApiData = {
      exchangeId: parseInt(params.get("id") ?? "0"),
      confirm: confirm
    }
    setError(undefined);
    setLoading(true);
    runRequest(new ExchangeUpdateApiAction(), undefined, data, undefined)
      .then(() => manageSuccess())
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }

  const manageSuccess = () => {
    router.replace(exchangeData?.action == "order" ? "/booking" : "/room");
  }

  useTitle(t("authentication.transfer_confirm.title"));

  const isOwner = exchangeData && userDisplay && exchangeData.sourceUser.userId === userDisplay.display.userId;

  const ticketData = exchangeData && exchangeData.fullOrderExchange
    ? calcTicketData(exchangeData.fullOrderExchange)
    : null;
  if (exchangeData && exchangeData.fullOrderExchange) {
    exchangeData.fullOrderExchange.extraDays = "BOTH";
  }
  return <>
    <div className="horizontal-list gap-4mm flex-center">
      <span className="title-pair">
        <Icon icon="DESIGN_SERVICES"/>
        <span className="titular bold highlight">furpanel</span>
        <span> - </span>
        <span className="titular bold">{t('authentication.transfer_confirm.title').toLowerCase()}</span>
      </span>
    </div>
    {error && <ModalError error={error} />}
    {loading && <LoadingPanel />}
    {exchangeData && userDisplay && <>
      <div className="exchange-info rounded-l vertical-list gap-2mm">
        <span className="title bold exchange-title rounded-m horizontal-list gap-2mm flex-vertical-center flex-wrap">
          {t.rich(`authentication.transfer_confirm.${exchangeData.action}.${isOwner ? "sent" : "received"}`, {
            source: () => <><UserPicture userData={exchangeData.sourceUser} />{exchangeData.sourceUser.fursonaName}</>,
            target: () => <><UserPicture userData={exchangeData.targetUser} />{exchangeData.targetUser.fursonaName}</>,
          })}
        </span>
        <div className="exchange-items vertical-list gap-4mm">
          {/* Source room data */}
          {exchangeData.sourceRoomExchange && <>
            <div className="item-info vertical-list rounded-m">
              {renderRoom(exchangeData.sourceUser, exchangeData.sourceRoomExchange)}
            </div>
          </>}
          {/* Target room data */}
          {!exchangeData.targetRoomInfoHidden && exchangeData.targetRoomExchange && <>
            <hr />
            <div className="item-info vertical-list rounded-m">
              {renderRoom(exchangeData.targetUser, exchangeData.targetRoomExchange)}
            </div>
          </>}
          {/* Order data */}
          {exchangeData.fullOrderExchange && ticketData && <>
            <div className="item-info vertical-list rounded-m">
              <span className="title item-title horizontal-list flex-vertical-center gap-2mm">
                <Icon className="large" icon="LOCAL_ACTIVITY"/>
                {t.rich("authentication.transfer_confirm.order.order_title", {
                  user: () => <>
                    <UserPicture userData={exchangeData.sourceUser} />
                    {exchangeData.sourceUser.fursonaName}
                  </>
                })}
              </span>
              <div className="descriptive vertical-list item-content gap-2mm rounded-m">
                {/* Ticket name */}
                <span className="horizontal-list gap-2mm">
                  <Icon icon="LOCAL_ACTIVITY"/>
                  {t.rich(`furpanel.booking.items.${ticketData.ticketName}`, {
                    sponsor: (chunks) => <b className="sponsor-highlight">{chunks}</b>,
                    supersponsor: (chunks) => <b className="super-sponsor-highlight">{chunks}</b>,
                    ultrasponsor: (chunks) => <b className="ultra-sponsor-highlight">{chunks}</b>
                  })}
                </span>
                {/* Daily days */}
                {ticketData?.isDaily && <span className="horizontal-list gap-2mm">
                  {t("furpanel.booking.items.daily_days",
                    { days: ticketData.dailyDays?.map(dt => formatter.dateTime(dt, { day: "2-digit" })).join(", ") ?? "" })}
                </span>}
                {/* Extra days */}
                {exchangeData.fullOrderExchange.extraDays && exchangeData.fullOrderExchange.extraDays !== "NONE" &&
                  <span className="horizontal-list gap-2mm">
                    <Icon icon="CALENDAR_ADD_ON"/>
                    {t(`furpanel.booking.items.extra_days_${exchangeData.fullOrderExchange.extraDays}`)}
                  </span>}
                {/* Room */}
                {exchangeData.fullOrderExchange.room && <span className="horizontal-list gap-2mm">
                  <Icon icon="BED"/>
                  {translate(exchangeData.fullOrderExchange.room.roomTypeNames, locale)}
                  &nbsp;
                  ({t("furpanel.booking.items.room_capacity",
                    { capacity: exchangeData.fullOrderExchange.room.roomCapacity })})
                </span>}
                {/* Board */}
                {exchangeData.fullOrderExchange.board != Board.NONE && <span className="horizontal-list gap-2mm">
                  <Icon icon="DINING"/>
                  {t(`furpanel.booking.items.board_${exchangeData.fullOrderExchange.board}`)}
                  </span>}
              </div>
            </div>
          </>}
        </div>
      </div>
      <div className="horizontal-list gap-4mm">
        <Button className="success" iconName={"CHECK"} busy={loading} onClick={() => updateExchangeStatus(true)}>
          {t("common.accept")}
        </Button>
        <div className="spacer"></div>
        <Button className="danger" iconName={"CANCEL"} busy={loading} onClick={() => updateExchangeStatus(false)}>
          {t("common.refuse")}
        </Button>
      </div>
    </>}
  </>;
}
