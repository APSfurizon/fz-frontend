import { ICONS } from "../icon";
import {
    useState, CSSProperties, FormEvent, Dispatch, SetStateAction, useEffect, useRef,
    createContext, useContext,
    MutableRefObject,
    useImperativeHandle
} from "react";
import { useTranslations } from "next-intl";
import Button from "./button";
import { FormApiAction, InterRequest } from "@/lib/components/dataForm";
import { ApiDetailedErrorResponse, ApiErrorResponse, ApiResponse, runFormRequest } from "@/lib/api/global";
import "@/styles/components/dataForm.css";

export interface SaveButtonData {
    text: string,
    iconName: string
}

// Context management
interface FormUpdate {
    reset: boolean,
    setReset: (b: boolean) => void,
    globalDisabled: boolean
}

const FormContext = createContext<FormUpdate | undefined>(undefined);

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        return { reset: null, setReset: () => { }, globalDisabled: false };
    }
    return context;
};


export default function DataForm<T extends FormApiAction<any, any, any>>({
    additionalButtons,
    onSuccess,
    onFail,
    onBeforeSubmit,
    children,
    checkFn,
    className,
    disabled = false,
    disableSave = false,
    endpoint,
    formRef,
    hideSave = false,
    hideReset = true,
    loading,
    editFormData,
    setLoading,
    style,
    saveButton,
    resetOnFail = true,
    resetOnSuccess = false,
    restPathParams,
    shouldReset = false,
    entityChanged
}: Readonly<{
    additionalButtons?: React.ReactNode,
    onSuccess?: (data: boolean | ApiResponse) => any,
    onFail?: (data: ApiErrorResponse | ApiDetailedErrorResponse) => any,
    onBeforeSubmit?: () => void,
    editFormData?: (data: FormData) => FormData,
    checkFn?: (e: FormData, form: HTMLFormElement) => boolean,
    children?: React.ReactNode,
    className?: string,
    disabled?: boolean,
    endpoint?: string,
    formRef?: MutableRefObject<HTMLFormElement | null>,
    hideSave?: boolean,
    hideReset?: boolean,
    disableSave?: boolean,
    loading?: boolean,
    setLoading?: Dispatch<SetStateAction<boolean>>,
    style?: CSSProperties,
    saveButton?: SaveButtonData,
    resetOnFail?: boolean,
    resetOnSuccess?: boolean,
    restPathParams?: string[],
    shouldReset?: boolean,
    initialEntity?: InterRequest<T>,
    entityChanged?: MutableRefObject<boolean | null>,
}>) {
    const [reset, setReset] = useState(false);
    const t = useTranslations('components');
    const inputRef = useRef<HTMLFormElement>(null);
    useImperativeHandle(formRef, () => inputRef.current!);

    if (saveButton === undefined) saveButton = {
        text: t('dataForm.save'),
        iconName: ICONS.SAVE
    };

    useEffect(() => {
        if (shouldReset) {
            setReset(true);
        }
    }, [shouldReset])

    useEffect(() => {
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
        if (onBeforeSubmit) onBeforeSubmit();
        if (setLoading) setLoading(true);
        runFormRequest(action, restPathParams, formData)
            .then((responseData) => onSuccess && onSuccess(responseData))
            .catch((errorData) => {
                if (onFail) onFail(errorData);
                if (resetOnFail) setReset(true);
            }).finally(() => {
                if (setLoading) setLoading(false);
                if (resetOnSuccess) { setReset(true); }
            });
        e.preventDefault();
        e.stopPropagation();
    }

    const showBottomToolbar = !hideSave || !hideReset || !!additionalButtons;

    return <>
        <form ref={inputRef}
            className={`data-form vertical-list ${className ?? ""}`}
            action={endpoint}
            onSubmit={onFormSubmit}
            onReset={() => setReset(true)}
            style={{ ...style }}>
            <FormContext.Provider value={{ reset, setReset, globalDisabled: disabled }}>
                {children}
            </FormContext.Provider>
            {showBottomToolbar && (
                <div className="toolbar-bottom gap-2mm">
                    <div className="spacer"></div>
                    {!hideSave && <Button type="submit"
                        disabled={disableSave}
                        iconName={saveButton.iconName}
                        busy={loading}>
                        {saveButton.text}
                    </Button>}
                    {!hideReset && <Button type="reset"
                        iconName={saveButton.iconName}
                        busy={loading}>
                        {t("common.CRUD.reset")}
                    </Button>}
                    {additionalButtons}
                </div>
            )}
        </form>
    </>
}