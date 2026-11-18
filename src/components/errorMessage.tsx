import { ApiErrorResponse } from "@/lib/api/networking/types";
import { copyContent, isEmpty } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

type ErrorData = {
  code?: string;
  message: string;
};

export default function ErrorMessage({ error }: Readonly<{ error?: ApiErrorResponse }>) {
  const t = useTranslations();
  const errors = useMemo(() => {
    const toReturn: ErrorData[] = [];
    if (!error?.errors) {
      toReturn.push({ message: error?.message ?? t("common.unknown_error") });
    }
    toReturn.push(...(error?.errors ?? []).map((err) => ({ code: err.code, message: err.message })));

    return toReturn;
  }, [error]);

  const requestId = error?.requestId;

  return (
    <div className="flex flex-col gap-2" aria-live="assertive">
      <ul aria-relevant="additions text">
        {errors.map((err, index) => (
          <li key={index} className="text-sm">
            {err.message} <kbd>{err.code ? `(${err.code})` : ""}</kbd>
          </li>
        ))}
      </ul>
      {!isEmpty(requestId) && (
        <>
          <span className="text-xs">
            {t("common.request_id")}&nbsp;
            <a
              title={t("common.util.hoverable")}
              className="active:bg-accent rounded-sm p-1 hover:text-black dark:hover:text-white"
              onClick={(e) => copyContent(e.currentTarget)}
            >
              {requestId}
            </a>
          </span>
        </>
      )}
    </div>
  );
}
