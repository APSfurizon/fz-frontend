import { useTranslations } from "next-intl";
import { ApiDetailedErrorResponse, ApiErrorResponse } from "../_lib/api/global";

export default function ModalError({error, translationRoot, translationKey}: Readonly<{error?: ApiErrorResponse, translationRoot: string, translationKey: string}>) {
    const t = useTranslations(translationRoot);
    const tcommon = useTranslations("common");
    const errors = [];
    let requestId = null;
    if (!error) {
        errors.push("unknown_error");
    } else {
        requestId = error.requestId
        if ("errors" in error) {
            const detail: ApiDetailedErrorResponse = error as ApiDetailedErrorResponse;
            errors.push(detail.errors.map(err=>err.code));
        } else {
            errors.push(error.errorMessage);
        }
    }

    return <div className="error">
        <span className="title">{tcommon("error_header", {count: errors.length})}</span>
        <ul>
            {errors.map(err=><li>{t(`${translationKey}.${err}`)}</li>)}
        </ul>
        <span>{tcommon("request_id")} {requestId}</span>
    </div>
}