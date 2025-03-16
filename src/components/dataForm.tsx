import Icon, { ICONS } from "./icon";
import { useState, MouseEvent, CSSProperties, FormEvent, Dispatch, SetStateAction, useEffect, useRef, createContext, useContext } from "react";
import { useTranslations } from "next-intl";
import Button from "./button";
import "@/styles/components/dataForm.css";
import { FormApiAction } from "@/lib/components/dataForm";
import { ApiDetailedErrorResponse, ApiErrorResponse, ApiResponse, runFormRequest } from "@/lib/api/global";

export interface SaveButtonData {
    text: string,
    iconName: string
}

// Context management
interface FormUpdate {
    reset: boolean,
    setReset: (b: boolean) => void
}

const FormContext = createContext<FormUpdate | undefined>(undefined);

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
      return {reset: null, setReset: () => {}};
    }
    return context;
};
  

export default function DataForm ({action, onSuccess, onFail, onBeforeSubmit, children, checkFn, className, disabled, disableSave=false, endpoint, hideSave=false, loading, method="POST", editFormData, setLoading, style, saveButton, resetOnFail=true, resetOnSuccess=false, restPathParams, shouldReset=false}: Readonly<{
    action?: FormApiAction<any, any, any>,
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
    loading?: boolean,
    method?: string,
    setLoading?: Dispatch<SetStateAction<boolean>>,
    style?: CSSProperties,
    saveButton?: SaveButtonData,
    resetOnFail?: boolean,
    resetOnSuccess?: boolean,
    restPathParams?: string[],
    shouldReset?: boolean,
  }>) {
    const [reset, setReset] = useState(false);
    const t = useTranslations('components');
    const inputRef = useRef<HTMLFormElement>(null);
    if (saveButton === undefined) saveButton = {
        text: t('dataForm.save'),
        iconName: ICONS.SAVE
    };

    useEffect(()=>{
        if (shouldReset) {
            setReset(true);
        }
    }, [shouldReset])

    useEffect(()=>{
        if (reset) {
            setReset(false);
        }
    }, [reset]);

    const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        if (!action) throw new Error("dataform must have an action to be submitted")
        const formData = editFormData ? editFormData(new FormData(e.currentTarget)) : new FormData(e.currentTarget);
        if (checkFn) {
            if (!checkFn(formData, e.currentTarget)) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
        }
        onBeforeSubmit && onBeforeSubmit();
        setLoading && setLoading (true);
        runFormRequest(action, restPathParams, formData)
            .then((responseData) => onSuccess && onSuccess (responseData))
            .catch((errorData) => {
                onFail && onFail (errorData);
                if (resetOnFail) {setReset(true);}
            }).finally(()=>{
                setLoading && setLoading(false);
                if (resetOnSuccess) {setReset(true);}
            });
        e.preventDefault();
        e.stopPropagation();
    }

    return <>
        <form ref={inputRef} className={`data-form vertical-list ${className}`} method={method} action={endpoint} aria-disabled={disabled} onSubmit={onFormSubmit}>
            <FormContext.Provider value={{reset, setReset}}>
                {children}
            </FormContext.Provider>
            {!hideSave && (
            <div className="toolbar-bottom">
                <Button type="submit" disabled={disableSave} iconName={saveButton.iconName} busy={loading}>{saveButton.text}</Button>
            </div>
            )}
        </form>
    </>
}