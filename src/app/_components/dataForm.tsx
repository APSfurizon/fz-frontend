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

export default function DataForm ({action, onSuccess, onFail, onBeforeSubmit, children, checkFn, className, disabled, disableSave=false, endpoint, hideSave=false, loading, method="POST", editFormData, setLoading, style, saveButton, resetOnFail=true, resetOnSuccess=false, restPathParams, shouldReset}: Readonly<{
    action: FormApiAction<any, any, any>,
    onSuccess?: (data: Boolean | ApiResponse) => any,
    onFail?: (data: ApiErrorResponse | ApiDetailedErrorResponse) => any,
    onBeforeSubmit?: Function,
    editFormData?: (data: FormData) => FormData,
    checkFn?: (e: FormData, form: HTMLFormElement) => boolean,
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
    resetOnSuccess?: boolean,
    restPathParams?: string[],
    shouldReset?: boolean,
  }>) {
    const t = useTranslations('components');
    const inputRef = useRef<HTMLFormElement>(null);
    if (saveButton === undefined) saveButton = {
        text: t('dataForm.save'),
        iconName: ICONS.SAVE
    };

    const resetData = () => {
        if (!inputRef?.current?.elements) return;
        Array.from(inputRef?.current?.elements).forEach((input)=>{
            if (input) {
                const event = new Event("change", { bubbles: true });
                input.dispatchEvent(event);
            }
        })
    }

    useEffect(()=>{
        if (shouldReset) {
            inputRef?.current?.reset ();
            resetData();
        }
    }, [shouldReset])

    const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        const formData = editFormData ? editFormData(new FormData(e.currentTarget)) : new FormData(e.currentTarget);
        if (checkFn) {
            if (!checkFn(formData, e.currentTarget)) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        }
        onBeforeSubmit && onBeforeSubmit();
        setLoading (true);
        runFormRequest(action, restPathParams, formData)
            .then((responseData) => onSuccess && onSuccess (responseData))
            .catch((errorData) => {
                onFail && onFail (errorData);
                if (resetOnFail) {inputRef?.current?.reset (); resetData();}
            }).finally(()=>{
                setLoading(false);
                if (resetOnSuccess) {inputRef?.current?.reset (); resetData();}
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