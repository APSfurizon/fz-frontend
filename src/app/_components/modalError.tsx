import { useTranslations } from "next-intl";
import { ApiDetailedErrorResponse, ApiErrorResponse } from "../_lib/api/global";
import { copyContent, isEmpty } from "../_lib/utils";

export default function ModalError({error, translationRoot, translationKey}: Readonly<{error?: ApiErrorResponse, translationRoot: string, translationKey: string}>) {
    const t = useTranslations(translationRoot);
    const tcommon = useTranslations("common");
    const errors = [];
    let requestId = undefined;
    console.log(error);
    if (!error) {
        errors.push("unknown_error");
    } else {
        requestId = error.requestId
        if ("errors" in error) {
            const detail: ApiDetailedErrorResponse = error as ApiDetailedErrorResponse;
            errors.push(detail.errors.map(err=>err.code));
        } else {
            errors.push(isEmpty(error.errorMessage) ? undefined : error.errorMessage);
        }
    }

    return <div className="error vertical-list gap-2mm">
        <span className="title medium">{tcommon("error_header", {count: errors.length})}</span>
        <ul style={{marginLeft: "1em"}}>
            {errors.map((err, index)=><li key={index} className="descriptive small">{err ? t(`${translationKey}.${err}`) : tcommon("unknown_error")}</li>)}
        </ul>
        {!isEmpty(requestId) && <>
            <hr></hr>
            <span className="descriptive small">{tcommon("request_id")}&nbsp;
                <a title={tcommon("util.hoverable")} style={{padding: "0em 0.2em"}} className="hoverable rounded-s" onClick={(e)=>copyContent(e.currentTarget)}>
                    {requestId}
                </a>
            </span>
        </> }
    </div>
}