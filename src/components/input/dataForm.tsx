import { MaterialIcon } from "../icon";
import {
    useState, CSSProperties, FormEvent, Dispatch, SetStateAction, useEffect, useRef,
    createContext, useContext,
    MutableRefObject,
    useImperativeHandle,
    RefObject,
    useMemo
} from "react";
import { useTranslations } from "next-intl";
import Button from "./button";
import { FormApiAction, InferRequest } from "@/lib/components/dataForm";
import { ApiDetailedErrorResponse, ApiErrorResponse, ApiResponse, runFormRequest } from "@/lib/api/global";
import "@/styles/components/dataForm.css";
import { useModalContext } from "../modal";
import { useModalUpdate } from "../context/modalProvider";
import ErrorMessage from "../errorMessage";

export interface SaveButtonData {
    text: string,
    icon: MaterialIcon
}

// Context management
interface FormUpdate {
    formReset: boolean,
    setFormReset: (b: boolean) => void,
    formDisabled: boolean,
    onFormChange: (fieldName?: string, value?: any) => void,
    formLoading: boolean
}

const FormContext = createContext<FormUpdate | undefined>(undefined);

export const useFormContext: () => FormUpdate = () => {
    const context = useContext(FormContext);
    if (!context) {
        return {
            formReset: false,
            setFormReset: () => { },
            formDisabled: false,
            onFormChange: () => { },
            formLoading: false
        };
    }
    return context;
};

export function compareFormObjects(a?: object, b?: object): boolean {
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
    busy,
    editFormData,
    setBusy,
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
    formRef?: RefObject<HTMLFormElement | null>,
    hideSave?: boolean,
    hideReset?: boolean,
    disableSave?: boolean,
    busy?: boolean,
    setBusy?: Dispatch<SetStateAction<boolean>>,
    style?: CSSProperties,
    saveButton?: SaveButtonData,
    resetOnFail?: boolean,
    resetOnSuccess?: boolean,
    restPathParams?: string[],
    shouldReset?: boolean,
    initialEntity?: InferRequest<T>
}>) {
    const [reset, setReset] = useState(false);
    const t = useTranslations("");
    const inputRef = useRef<HTMLFormElement>(null);
    useImperativeHandle(formRef, () => inputRef.current!);

    // Busy state logic
    // - Internal loading
    const [loading, setLoading] = useState(false);
    /**The final busy state, in or between the externally imposed busy state and internal loading */
    const isBusy = useMemo(()=>(busy ?? false) || loading, [busy, loading]);

    // - Context loading change logic
    const context = useModalContext();

    // -- Updates the context's busy state
    useEffect(()=>{
        context.setLoading(isBusy);
    }, [isBusy])

    // -- Aligns the external busy state
    useEffect(() => {
        setBusy && setBusy(loading);
    }, [loading])

    // Entity change logic
    const [currentEntity, setCurrentEntity] = useState<InferRequest<T> | undefined>(initialEntity);
    const [isEntityChanged, setEntityChanged] = useState(!!initialEntity ? false : true);
    const {showModal} = useModalUpdate();

    useEffect(() => {
        if (shouldReset) {
            setReset(true);
        }
    }, [shouldReset])

    useEffect(() => {
        if (reset) {
            setReset(false);
        }
        setCurrentEntity(initialEntity ? { ...initialEntity } : undefined);
    }, [reset]);

    const fail = useMemo(() => (data: ApiErrorResponse | ApiDetailedErrorResponse) => {
        if (onFail) {
            onFail(data);
        } else {
            showModal(t("common.error"), <ErrorMessage error={data} />);
        }
    }, [])

    const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        if (isBusy) {return;}
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
            setLoading(true);
            runFormRequest(action, restPathParams, formData)
                .then((responseData) => onSuccess && onSuccess(responseData))
                .catch((errorData) => {
                    fail(errorData);
                    if (resetOnFail) setReset(true);
                }).finally(() => {
                    setLoading(false);
                    if (resetOnSuccess) { setReset(true); }
                });
        } catch (e) {
            console.error(e);
            setLoading(false);
            fail(e ?? {errorMessage: "unknown"});
        }

        e.preventDefault();
        e.stopPropagation();
    }

    const onFormChange = (fieldName?: string, value?: any) => {
        if (!fieldName || !formRef?.current) return;
        const entity: InferRequest<T> = action?.dtoBuilder.mapToDTO(new FormData(formRef.current));
        if (value) {
            entity[fieldName] = value;
        }
        setCurrentEntity(entity);
    };

    useEffect(() => {
        const isChanged = !initialEntity
            ? true
            : !compareFormObjects(initialEntity, currentEntity);
        setEntityChanged(isChanged);
        if (onChange) onChange(isChanged, currentEntity);
    }, [currentEntity])

    const showBottomToolbar = !hideSave || !hideReset || !!additionalButtons;

    return <form ref={inputRef}
        className={`data-form vertical-list ${className ?? ""}`}
        action={endpoint}
        onSubmit={onFormSubmit}
        onReset={() => setReset(true)}
        style={{ ...style }}>
        <FormContext.Provider value={{
            formReset: reset,
            setFormReset: setReset,
            formDisabled: disabled,
            onFormChange,
            formLoading: loading
        }}>
            {children}
        </FormContext.Provider>
        {showBottomToolbar && (
            <div className="toolbar-bottom gap-2mm">
                <div className="spacer"></div>
                {!hideSave && <Button type="submit"
                    disabled={disableSave}
                    icon={saveButton?.icon ?? "SAVE"}
                    busy={loading}>
                    {saveButton?.text ?? t("common.CRUD.save")}{isEntityChanged && !!initialEntity ? "*" : ""}
                </Button>}
                {!hideReset && <Button type="reset"
                    icon="REPLAY"
                    disabled={!isEntityChanged}
                    busy={loading}>
                    {t("common.CRUD.reset")}
                </Button>}
                {additionalButtons}
            </div>
        )}
    </form>;
}