import Icon, { ICONS } from "./icon";
import { useState, MouseEvent, CSSProperties, FormEvent, Dispatch, SetStateAction, useEffect } from "react";
import { useTranslations } from "next-intl";
import Button from "./button";
import "../styles/components/dataForm.css";
import { FormApiAction } from "../_lib/components/dataForm";
import { ApiDetailedErrorResponse, ApiErrorResponse, ApiResponse, runFormRequest } from "../_lib/api/global";

export interface SaveButtonData {
    text: string,
    iconName: string
}

export default function DataForm ({action, onSuccess, onFail, children, className, disabled, endpoint, loading, method="POST", setLoading, style, saveButton}: Readonly<{
    action: FormApiAction<any, any, any>,
    onSuccess?: (data: ApiResponse) => any,
    onFail?: (data: ApiErrorResponse | ApiDetailedErrorResponse) => any,
    children?: React.ReactNode,
    className?: string,
    disabled?: boolean,
    endpoint?: string,
    loading: boolean,
    method?: string,
    setLoading: Dispatch<SetStateAction<boolean>>,
    style?: CSSProperties,
    saveButton?: SaveButtonData
  }>) {
    const t = useTranslations('components');
    if (saveButton === undefined) saveButton = {
        text: t('dataForm.save'),
        iconName: ICONS.SAVE
    };

    const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        setLoading (true);
        runFormRequest(action, new FormData(e.currentTarget))
            .then((responseData) => onSuccess && onSuccess (responseData))
            .catch((errorData) => onFail && onFail (errorData))
            .finally(()=>setLoading(false));
        e.preventDefault();
        e.stopPropagation();
    }

    return <>
        <form className={`data-form vertical-list ${className}`} method={method} action={endpoint} aria-disabled={disabled} onSubmit={onFormSubmit}>
            {children}
            <div className="toolbar-bottom">
                <Button type="submit" iconName={saveButton.iconName} busy={loading}>{saveButton.text}</Button>
            </div>
        </form>
    </>
}