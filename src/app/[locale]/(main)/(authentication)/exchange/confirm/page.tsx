"use client"
import Icon, { ICONS } from "@/app/_components/icon";
import { ApiDetailedErrorResponse, ApiErrorResponse, isDetailedError, runRequest } from "@/app/_lib/api/global";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useTitle from "@/app/_lib/api/hooks/useTitle";
import { ExchangeStatusApiAction, ExchangeStatusApiResponse, ExchangeUpdateApiAction, ExchangeUpdateApiData } from "@/app/_lib/api/exchange";
import { buildSearchParams } from "@/app/_lib/utils";
import "../../../../../styles/authentication/login.css";
import Button from "@/app/_components/button";
import ModalError from "@/app/_components/modalError";
import { useUser } from "@/app/_lib/context/userProvider";
import UserPicture from "@/app/_components/userPicture";

export default function ExchangeConfirm() {
  const t = useTranslations("authentication");
  const tcommon = useTranslations("common");
  const router = useRouter();
  const params = useSearchParams();
  const {userDisplay, userLoading} = useUser();

  // Main logic
  const [error, setError] = useState <ApiErrorResponse | ApiDetailedErrorResponse | undefined> (undefined);
  const [loading, setLoading] = useState(false);
  const [exchangeData, setExchangeData] = useState<ExchangeStatusApiResponse>();
  const [isExchangeOwner, setExchangeOwner] = useState(false);

  // Exchange data
  useEffect(()=>{
    if (!userLoading) return;
    setLoading(true);
    runRequest(new ExchangeStatusApiAction(), undefined, undefined, 
      buildSearchParams({"id": params.get("id") ?? ""}))
    .then ((result)=>{
      const data = result as ExchangeStatusApiResponse;
      console.log(userDisplay);
      setExchangeData(data);
      setExchangeOwner(data.sourceUser.id === userDisplay?.display.id);
    }).catch ((err)=>setError(err))
    .finally(()=>setLoading(false));
  }, [userLoading]);

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
    {exchangeData && <>
      <div className="exchange-info">
        <span className="title horizontal-list gap-2mm flex-vertical-center">
          {t.rich(`exchange_confirm.exchange_title.${exchangeData.action}.${isExchangeOwner ? "sent" : "received"}`, {
            source: (chunks)=><><UserPicture userData={exchangeData.sourceUser}/>{exchangeData.sourceUser.fursonaName}</>,
            target: (chunks)=><><UserPicture userData={exchangeData.targetUser}/>{exchangeData.targetUser.fursonaName}</>,
          })}
        </span>
      </div>
      <div className="horizontal-list gap-4mm">
        <Button className="success" iconName={ICONS.CHECK} busy={loading} onClick={()=>updateExchangeStatus(true)}>{tcommon("confirm")}</Button>
        <div className="spacer"></div>
        <Button className="danger" iconName={ICONS.CANCEL} busy={loading} onClick={()=>updateExchangeStatus(false)}>{tcommon("cancel")}</Button>
      </div>
    </>}
  </>;
}
  