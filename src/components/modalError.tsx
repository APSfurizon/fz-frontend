import { useTranslations } from "next-intl";
import { ApiDetailedErrorResponse, ApiErrorResponse } from "@/lib/api/global";
import { copyContent, isEmpty } from "@/lib/utils";
import { useMemo } from "react";

type ErrorData = {
    code?: string,
    message: string
}

export default function ModalError({ error }: Readonly<{ error?: ApiErrorResponse }>) {
    const t = useTranslations();
    const errors = useMemo(() => {
        const toReturn: ErrorData[] = [];
        if (error &&"errors" in error) {
            const detail: ApiDetailedErrorResponse = error as ApiDetailedErrorResponse;
            toReturn.push(...detail.errors.map(err => ({ code: err.code, message: err.message})));
        } else {
            if (!error || isEmpty(error?.errorMessage)) {
                toReturn.push({message: t("common.unknown_error")});
            } else {
                toReturn.push({
                    code: undefined,
                    message: error.errorMessage!
                });
            }
        }
       
        return toReturn;
    }, [error]);

    const requestId = error?.requestId;

    return <div className="error vertical-list gap-2mm" aria-live="assertive">
        <span className="title medium">{t("common.error_header", { count: errors.length })}</span>
        <ul style={{ marginLeft: "1em" }} aria-relevant="additions text">
            {errors.map((err, index) => <li key={index} className="descriptive small">{err.message} <kbd>{err.code ? `(${err.code})` : ""}</kbd></li>)}
        </ul>
        {!isEmpty(requestId) && <>
            <hr></hr>
            <span className="descriptive small">{t("common.request_id")}&nbsp;
                <a title={t("common.util.hoverable")} style={{ padding: "0em 0.2em" }} className="hoverable rounded-s" onClick={(e) => copyContent(e.currentTarget)}>
                    {requestId}
                </a>
            </span>
        </>}
    </div>
}