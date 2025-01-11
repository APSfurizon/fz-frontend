"use client"
import Icon, { ICONS } from "@/app/_components/icon";
import { ApiDetailedErrorResponse, ApiErrorResponse, isDetailedError, runRequest } from "@/app/_lib/api/global";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { ExchangeStatusApiAction, ExchangeStatusApiResponse, ExchangeUpdateApiAction, ExchangeUpdateApiData } from "@/app/_lib/api/exchange";
import { buildSearchParams, translate } from "@/app/_lib/utils";
import Button from "@/app/_components/button";
import ModalError from "@/app/_components/modalError";
import { useUser } from "@/app/_lib/context/userProvider";
import UserPicture from "@/app/_components/userPicture";
import { RoomData } from "@/app/_lib/api/room";
import "../../../../../styles/authentication/login.css";
import "../../../../../styles/authentication/exchangeConfirm.css";
import { UserData } from "@/app/_lib/api/user";
import { calcTicketData } from "@/app/_lib/api/booking";

export default function ExchangeConfirm() {
  const t = useTranslations("authentication");
  const tfurpanel = useTranslations("furpanel");
  const tcommon = useTranslations("common");
  const formatter = useFormatter();
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const {userDisplay, userLoading} = useUser();

  const renderRoom = (userData: UserData, data: RoomData) => {
    return <>
    <span className="title item-title horizontal-list flex-vertical-center gap-2mm">
      <Icon className="large" iconName={ICONS.PACKAGE_2}></Icon>
      {t.rich("exchange_confirm.room.room_title", {
        user: (chunks)=><><UserPicture userData={userData}/>{userData.fursonaName}</>,
      })}
    </span>
    <div className="horizontal-list item-content flex-vertical-center gap-2mm rounded-m">
      <Icon className="xx-large" iconName={ICONS.BEDROOM_PARENT}></Icon>
      <div className="vertical-list">
        <span className="title horizontal-list flex-vertical-center">
          {translate(data.roomTypeNames, locale)}
        </span>
        <span className="small descriptive color-subtitle">{tfurpanel("booking.items.room_capacity", {capacity: data.roomCapacity})}</span>
      </div>
    </div>
    </>;
  }

  // Main logic
  const [error, setError] = useState <ApiErrorResponse | ApiDetailedErrorResponse | undefined> (undefined);
  const [loading, setLoading] = useState(false);
  const [exchangeData, setExchangeData] = useState<ExchangeStatusApiResponse>();

  // Exchange data
  useEffect(()=>{
    setLoading(true);
    runRequest(new ExchangeStatusApiAction(), undefined, undefined, 
      buildSearchParams({"id": params.get("id") ?? ""}))
    .then ((result)=>setExchangeData(result as ExchangeStatusApiResponse))
    .catch ((err)=>setError(err))
    .finally(()=>setLoading(false));
  }, []);

  // Exchange confirm
  const updateExchangeStatus = (confirm: boolean) => {
    let data: ExchangeUpdateApiData = {
      exchangeId: parseInt(params.get("id") ?? "0"),
      confirm: confirm
    }
    setError(undefined);
    setLoading(true);
    runRequest(new ExchangeUpdateApiAction(), undefined, data, undefined)
    .then(()=>manageSuccess())
    .catch((err)=>setError(err))
    .finally(()=>setLoading(false));
  }

  const manageError = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
    setError(err);
  }

  const manageSuccess = () => {
    router.replace(exchangeData?.action == "order" ? "/booking" : "/room");
  }

  useTitle(t("exchange_confirm.title"));

  const isOwner = exchangeData && userDisplay && exchangeData.sourceUser.userId === userDisplay.display.userId;

  const ticketData = exchangeData && exchangeData.fullOrderExchange ? calcTicketData(exchangeData.fullOrderExchange) : null;
  if (exchangeData && exchangeData.fullOrderExchange) {
    exchangeData.fullOrderExchange.extraDays = "BOTH";
  }
  return <>
    <div className="horizontal-list gap-4mm flex-center">
      <span className="title-pair">
        <Icon iconName="design_services"></Icon>
        <span className="titular bold highlight">furpanel</span>
        <span> - </span>
        <span className="titular bold">{t('exchange_confirm.title').toLowerCase()}</span>
      </span>
    </div>
    {error && 
    <ModalError translationKey="exchange_confirm.errors" translationRoot="authentication" error={error}>
    </ModalError>
    }
    {loading && <span>
      <Icon iconName={ICONS.PROGRESS_ACTIVITY} className="loading-animation"></Icon>
      {tcommon("loading")}
    </span>}
    {exchangeData && userDisplay && <>
      <div className="exchange-info rounded-l vertical-list gap-2mm">
        <span className="title bold exchange-title rounded-m horizontal-list gap-2mm flex-vertical-center flex-wrap">
          {t.rich(`exchange_confirm.${exchangeData.action}.${isOwner ? "sent" : "received"}`, {
            source: (chunks)=><><UserPicture userData={exchangeData.sourceUser}/>{exchangeData.sourceUser.fursonaName}</>,
            target: (chunks)=><><UserPicture userData={exchangeData.targetUser}/>{exchangeData.targetUser.fursonaName}</>,
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
            <hr/>
            <div className="item-info vertical-list rounded-m">
              {renderRoom(exchangeData.targetUser, exchangeData.targetRoomExchange)}
            </div>
          </>}
          {/* Order data */}
          {exchangeData.fullOrderExchange && ticketData && <>
            <div className="item-info vertical-list rounded-m">
              <span className="title item-title horizontal-list flex-vertical-center gap-2mm">
                <Icon className="large" iconName={ICONS.LOCAL_ACTIVITY}></Icon>
                {t.rich("exchange_confirm.order.order_title", {
                  user: (chunks)=><><UserPicture userData={exchangeData.sourceUser}/>{exchangeData.sourceUser.fursonaName}</>,
                })}
              </span>
              <div className="descriptive vertical-list item-content gap-2mm rounded-m">
                {/* Ticket name */}
                <span className="horizontal-list gap-2mm">
                  <Icon iconName={ICONS.LOCAL_ACTIVITY}></Icon>
                  {tfurpanel.rich(`booking.items.${ticketData.ticketName}`, {
                      sponsor: (chunks) => <b className="sponsor-highlight">{chunks}</b>,
                      supersponsor: (chunks) => <b className="super-sponsor-highlight">{chunks}</b>
                  })}
                </span>
                {/* Daily days */}
                {ticketData?.isDaily && <span className="horizontal-list gap-2mm">
                  {tfurpanel("booking.items.daily_days", 
                    {days: ticketData.dailyDays?.map(dt => formatter.dateTime(dt, {day: "2-digit"})).join(", ")})}
                </span>}
                {/* Extra days */}
                {exchangeData.fullOrderExchange.extraDays && exchangeData.fullOrderExchange.extraDays !== "NONE" &&
                <span className="horizontal-list gap-2mm">
                  <Icon iconName={ICONS.CALENDAR_ADD_ON}></Icon>
                  {tfurpanel(`booking.items.extra_days_${exchangeData.fullOrderExchange.extraDays}`)}
                </span>}
                {/* Room */}
                {exchangeData.fullOrderExchange.room && <span className="horizontal-list gap-2mm">
                  <Icon iconName={ICONS.BED}></Icon>
                  {translate(exchangeData.fullOrderExchange.room.roomTypeNames, locale)}
                  &nbsp;
                  ({tfurpanel("booking.items.room_capacity", 
                    {capacity: exchangeData.fullOrderExchange.room.roomCapacity})})
                </span>}
              </div>
            </div>
          </>}
        </div>
      </div>
      <div className="horizontal-list gap-4mm">
        <Button className="success" iconName={ICONS.CHECK} busy={loading} onClick={()=>updateExchangeStatus(true)}>{tcommon("accept")}</Button>
        <div className="spacer"></div>
        <Button className="danger" iconName={ICONS.CANCEL} busy={loading} onClick={()=>updateExchangeStatus(false)}>{tcommon("refuse")}</Button>
      </div>
    </>}
  </>;
}
  