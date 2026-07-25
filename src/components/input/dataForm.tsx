import { MaterialIcon } from "../icon";
import {
  useState,
  CSSProperties,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  createContext,
  useContext,
  useImperativeHandle,
  RefObject,
  useMemo,
  SubmitEvent,
  useCallback,
} from "react";
import { useTranslations } from "next-intl";
import FpButton from "./fpButton";
import { FormApiAction, FormValidationError, InferRequest } from "@/lib/components/dataForm";
import { runFormRequest } from "@/lib/api/networking/main";
import { ApiErrorResponse } from "@/lib/api/networking/types";
import { ApiResponse } from "@/lib/api/networking/types";
import "@/styles/components/dataForm.css";
import { useModalContext } from "../modal";
import { useModalUpdate } from "../context/modalProvider";
import ErrorMessage from "../errorMessage";

export interface SaveButtonData {
  text: string;
  icon: MaterialIcon;
}

// Context management
interface FormUpdate {
  formReset: boolean;
  setFormReset: (b: boolean) => void;
  formDisabled: boolean;
  onFormChange: (fieldName?: string, value?: any) => void;
  formLoading: boolean;
  registerField: (fieldName: string | undefined, reference: RefObject<HTMLInputElement | null>) => void;
}

const FormContext = createContext<FormUpdate | undefined>(undefined);

export const useFormContext: () => FormUpdate = () => {
  const context = useContext(FormContext);
  if (!context) {
    return {
      formReset: false,
      setFormReset: () => {},
      formDisabled: false,
      onFormChange: () => {},
      formLoading: false,
      registerField: () => {},
    };
  }
  return context;
};

export function compareFormObjects(a?: object, b?: object): boolean {
  return (
    Object.entries(a ?? {})
      .sort()
      .toString() ===
    Object.entries(b ?? {})
      .sort()
      .toString()
  );
}

type DataFormProps<T extends FormApiAction<any, any, any>> = {
  additionalButtons?: React.ReactNode;
  action?: T;
  onChange?: (different: boolean, newEntity: InferRequest<T> | undefined) => void;
  onSuccess?: (data: boolean | ApiResponse) => any;
  onFail?: (data: ApiErrorResponse) => any;
  onBeforeSubmit?: () => void;
  editBodyData?: (data: InferRequest<T>) => InferRequest<T>;
  editFormData?: (data: FormData) => FormData;
  checkFn?: (e: FormData, form: HTMLFormElement) => FormValidationError[];
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  endpoint?: string;
  formRef?: RefObject<HTMLFormElement | null>;
  hideSave?: boolean;
  showReset?: boolean;
  disableSave?: boolean;
  busy?: boolean;
  setBusy?: Dispatch<SetStateAction<boolean>>;
  style?: CSSProperties;
  saveButton?: SaveButtonData;
  resetOnFail?: boolean;
  resetOnSuccess?: boolean;
  pathParams?: Record<string, any>;
  additionalPath?: string[];
  shouldReset?: boolean;
  initialEntity?: InferRequest<T>;
};

export default function DataForm<T extends FormApiAction<any, any, any>>(props: Readonly<DataFormProps<T>>) {
  const [reset, setReset] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useImperativeHandle(props.formRef, () => formRef.current!);
  const t = useTranslations();

  // Busy state logic
  // - Internal loading
  const [loading, setLoading] = useState(false);
  /**The final busy state, in or between the externally imposed busy state and internal loading */
  const isBusy = useMemo(() => (props.busy ?? false) || loading, [props.busy, loading]);

  // - Context loading change logic
  const context = useModalContext();

  // -- Updates the context's busy state
  useEffect(() => {
    context.setLoading(isBusy);
  }, [isBusy]);

  // -- Aligns the external busy state
  useEffect(() => {
    if (props.setBusy) {
      props.setBusy(loading);
    }
  }, [loading]);

  // Field map logic
  const [fieldMap, setFieldMap] = useState<Record<string, RefObject<HTMLInputElement>>>({});
  const registerField = useCallback((fieldName: string | undefined, ref: RefObject<HTMLInputElement | null>) => {
    if (!fieldName || !ref.current) return;
    setFieldMap((value) => {
      value[fieldName] = ref as RefObject<HTMLInputElement>;
      return value;
    });
  }, []);

  const clearValidationErrors = useCallback(() => {
    Object.values(fieldMap).forEach((input) => input.current?.setCustomValidity(""));
  }, []);

  // Entity change logic
  const [currentEntity, setCurrentEntity] = useState<InferRequest<T> | undefined>(props.initialEntity);
  const [isEntityChanged, setEntityChanged] = useState(!!props.initialEntity ? false : true);
  const { showModal } = useModalUpdate();

  useEffect(() => {
    if (props.shouldReset) {
      setReset(true);
    }
  }, [props.shouldReset]);

  useEffect(() => {
    if (reset) {
      setReset(false);
    }
    setCurrentEntity(props.initialEntity ? { ...props.initialEntity } : undefined);
  }, [reset]);

  const fail = useMemo(
    () => (data: ApiErrorResponse) => {
      if (props.onFail) {
        props.onFail(data);
      } else {
        showModal(t("common.error"), <ErrorMessage error={data} />);
      }
    },
    []
  );

  const onFormSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    if (isBusy) {
      return;
    }
    try {
      if (!props.action) throw new Error("dataform must have an action to be submitted");
      const formData = props.editFormData
        ? props.editFormData(new FormData(e.currentTarget))
        : new FormData(e.currentTarget);
      // Perform check functions
      if (props.checkFn) {
        const formCheckErrors = props.checkFn(formData, e.currentTarget);
        formCheckErrors.forEach((validation, index) => {
          const element = fieldMap[validation.field]?.current;
          element?.setCustomValidity(validation.error);
          // Report first
          if (index == 0 && element) {
            window.scrollBy({ top: element.scrollTop });
            element?.reportValidity();
          }
        });

        if (formCheckErrors?.length) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        clearValidationErrors();
      }
      if (props.onBeforeSubmit) props.onBeforeSubmit();
      setLoading(true);
      runFormRequest({
        action: props.action,
        pathParams: props.pathParams,
        additionalPath: props.additionalPath,
        bodyModification: props.editBodyData,
        body: formData,
      })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        .then((responseData) => props.onSuccess?.(responseData as boolean | ApiResponse))
        .catch((errorData) => {
          fail(errorData as ApiErrorResponse);
          if (props.resetOnFail) setReset(true);
        })
        .finally(() => {
          setLoading(false);
          if (props.resetOnSuccess) {
            setReset(true);
          }
        });
    } catch (e) {
      console.error(e);
      setLoading(false);
      fail(e as ApiErrorResponse);
    }

    e.preventDefault();
    e.stopPropagation();
  };

  const onFormChange = useCallback(
    (fieldName?: string, value?: any) => {
      if (!fieldName || !formRef?.current) return;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const entity: InferRequest<T> = props.action?.dtoBuilder.mapToDTO(new FormData(formRef.current));
      if (entity && value) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        entity[fieldName] = value;
      }
      setCurrentEntity(entity);
    },
    [props.formRef?.current]
  );

  useEffect(() => {
    const isChanged = !props.initialEntity ? true : !compareFormObjects(props.initialEntity, currentEntity);
    setEntityChanged(isChanged);
    clearValidationErrors();
    if (props.onChange) {
      props.onChange(isChanged, currentEntity);
    }
  }, [currentEntity]);

  const showBottomToolbar = !props.hideSave || props.showReset || !!props.additionalButtons;

  return (
    <form
      ref={formRef}
      className={`data-form vertical-list ${props.className ?? ""}`}
      action={props.endpoint}
      onSubmit={onFormSubmit}
      onReset={() => setReset(true)}
      style={props.style}
    >
      <FormContext.Provider
        value={{
          formReset: reset,
          setFormReset: setReset,
          formDisabled: !!props.disabled,
          onFormChange,
          formLoading: loading,
          registerField,
        }}
      >
        {props.children}
      </FormContext.Provider>
      {showBottomToolbar && (
        <div className="toolbar-bottom gap-2mm">
          <div className="spacer"></div>
          {!props.hideSave && (
            <FpButton type="submit" disabled={props.disableSave} icon={props.saveButton?.icon ?? "SAVE"} busy={loading}>
              {props.saveButton?.text ?? t("common.CRUD.save")}
              {isEntityChanged && !!props.initialEntity ? "*" : ""}
            </FpButton>
          )}
          {props.showReset && (
            <FpButton type="reset" icon="REPLAY" disabled={!isEntityChanged} busy={loading}>
              {t("common.CRUD.reset")}
            </FpButton>
          )}
          {props.additionalButtons}
        </div>
      )}
    </form>
  );
}
