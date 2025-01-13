import Icon, { ICONS } from "./icon";
import { useState, MouseEvent, CSSProperties, FormEvent, Dispatch, SetStateAction, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import Button from "./button";
import "../styles/components/dataForm.css";
import { FormApiAction } from "../_lib/components/dataForm";
import { ApiDetailedErrorResponse, ApiErrorResponse, ApiResponse, runFormRequest } from "../_lib/api/global";

export interface SaveButtonData {
    text: string,
    iconName: string
}

export default function DataForm ({action, onSuccess, onFail, onBeforeSubmit, children, checkFn, className, disabled, disableSave=false, endpoint, hideSave=false, loading, method="POST", setLoading, style, saveButton, resetOnFail=true, resetOnSuccess=false}: Readonly<{
    action: FormApiAction<any, any, any>,
    onSuccess?: (data: Boolean | ApiResponse) => any,
    onFail?: (data: ApiErrorResponse | ApiDetailedErrorResponse) => any,
    onBeforeSubmit?: Function,
    checkFn?: () => boolean,
    children?: React.ReactNode,
    className?: string,
    disabled?: boolean,
    endpoint?: string,
    hideSave?: boolean,
    disableSave?: boolean,
    loading: boolean,
    method?: string,
    setLoading: Dispatch<SetStateAction<boolean>>,
    style?: CSSProperties,
    saveButton?: SaveButtonData,
    resetOnFail?: boolean,
    resetOnSuccess?: boolean
  }>) {
    const t = useTranslations('components');
    const inputRef = useRef<HTMLFormElement>(null);
    if (saveButton === undefined) saveButton = {
        text: t('dataForm.save'),
        iconName: ICONS.SAVE
    };

    const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        if (checkFn) {
            if (!checkFn()) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        }
        onBeforeSubmit && onBeforeSubmit();
        setLoading (true);
        runFormRequest(action, undefined, new FormData(e.currentTarget))
            .then((responseData) => onSuccess && onSuccess (responseData))
            .catch((errorData) => {
                onFail && onFail (errorData);
                if (resetOnFail) inputRef?.current?.reset ();
            }).finally(()=>{
                setLoading(false);
                if (resetOnSuccess) inputRef?.current?.reset ();
            });
        e.preventDefault();
        e.stopPropagation();
    }

    return <>
        <form ref={inputRef} className={`data-form vertical-list ${className}`} method={method} action={endpoint} aria-disabled={disabled} onSubmit={onFormSubmit}>
            {children}
            {!hideSave && (
            <div className="toolbar-bottom">
                <Button type="submit" disabled={disableSave} iconName={saveButton.iconName} busy={loading}>{saveButton.text}</Button>
            </div>
            )}
        </form>
    </>
}