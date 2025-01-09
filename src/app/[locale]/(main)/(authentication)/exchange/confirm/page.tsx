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

export default function ExchangeConfirm() {
  const t = useTranslations("authentication");
  const tcommon = useTranslations("common");
  const router = useRouter();
  const params = useSearchParams();

  // Main logic
  const [error, setError] = useState <String | undefined> (undefined);
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

    runRequest(new ExchangeUpdateApiAction(), undefined, data, undefined)
    .then(()=>manageSuccess())
    .catch((err)=>setError(err))
    .finally(()=>setLoading(false));
  }

  const manageError = (err: ApiErrorResponse | ApiDetailedErrorResponse) => {
    if(!isDetailedError (err)) {
      setError("network_error");
    } else {
      const errRes = err as ApiDetailedErrorResponse;
      const errorMessage = errRes.errors.length > 0 ? errRes.errors[0].code : t('login.errors.unknown_error');
      setError(errorMessage);
    }
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
    {error && <span className="error-container title small center">{t(`recover_confirm.errors.${(error ?? 'unknown_error').toLowerCase()}`)}</span>}
    {loading && <span>
      <Icon iconName={ICONS.PROGRESS_ACTIVITY} className="loading-animation"></Icon>
      {tcommon("loading")}
    </span>}
    {exchangeData && <>
      <div className="horizontal-list gap-4mm">
        <Button className="success" iconName={ICONS.CHECK} busy={loading} onClick={()=>updateExchangeStatus(true)}>{tcommon("confirm")}</Button>
        <div className="spacer"></div>
        <Button className="danger" iconName={ICONS.CANCEL} busy={loading} onClick={()=>updateExchangeStatus(false)}>{tcommon("cancel")}</Button>
      </div>
    </>}
  </>;
}
  