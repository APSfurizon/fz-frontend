import { ICONS } from "../icon";
import {
    useState, CSSProperties, FormEvent, Dispatch, SetStateAction, useEffect, useRef,
    createContext, useContext,
    MutableRefObject,
    useImperativeHandle
} from "react";
import { useTranslations } from "next-intl";
import Button from "./button";
import { FormApiAction, InferRequest } from "@/lib/components/dataForm";
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
    globalDisabled: boolean,
    onFormChange: (fieldName?: string) => void
}

const FormContext = createContext<FormUpdate | undefined>(undefined);

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        return { reset: null, setReset: () => { }, globalDisabled: false, onFormChange: () => {} };
    }
    return context;
};

export function compareFormObjects (a?: object, b?: object): boolean {
    return Object.entries(a ?? {}).sort().toString() === Object.entries(b ?? {}).sort().toString();
}

export default function DataForm<T extends FormApiAction<any, any, any>>({
    additionalButtons,
    action,
    onChange,
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
    initialEntity
}: Readonly<{
    additionalButtons?: React.ReactNode,
    action?: T,
    onChange?: (different: boolean, newEntity: InferRequest<T> | undefined) => void,
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
    initialEntity?: InferRequest<T>
}>) {
    const [reset, setReset] = useState(false);
    const t = useTranslations('components');
    const inputRef = useRef<HTMLFormElement>(null);
    useImperativeHandle(formRef, () => inputRef.current!);

    // Entity change logic
    const [currentEntity, setCurrentEntity] = useState<InferRequest<T> | undefined>(initialEntity);
    const [isEntityChanged, setEntityChanged] = useState(!!initialEntity ? false : true);
    
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
        setCurrentEntity(initialEntity ? {...initialEntity} : undefined);
    }, [reset]);

    const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        try {
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
        } catch (e) {
            console.error (e);
            if (setLoading) setLoading(false);
            if (onFail) onFail(e ?? "unknown");
        }
        
        e.preventDefault();
        e.stopPropagation();
    }

    const onFormChange = (fieldName?: string) => {
        if (!fieldName || !formRef?.current)  return;
        const entity: InferRequest<T> = action?.dtoBuilder.mapToDTO(new FormData(formRef.current));
        setCurrentEntity(entity);
    };

    useEffect (()=>{
        const isChanged = !initialEntity
            ? true
            : !compareFormObjects(initialEntity, currentEntity);
        setEntityChanged(isChanged);
        if(onChange) onChange(isChanged, currentEntity);
    }, [currentEntity])

    const showBottomToolbar = !hideSave || !hideReset || !!additionalButtons;

    return <>
        <form ref={inputRef}
            className={`data-form vertical-list ${className ?? ""}`}
            action={endpoint}
            onSubmit={onFormSubmit}
            onReset={() => setReset(true)}
            style={{ ...style }}>
            <FormContext.Provider value={{ reset, setReset, globalDisabled: disabled, onFormChange }}>
                {children}
            </FormContext.Provider>
            {showBottomToolbar && (
                <div className="toolbar-bottom gap-2mm">
                    <div className="spacer"></div>
                    {!hideSave && <Button type="submit"
                        disabled={disableSave}
                        iconName={saveButton.iconName}
                        busy={loading}>
                        {saveButton.text}{isEntityChanged ? "*" : ""}
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