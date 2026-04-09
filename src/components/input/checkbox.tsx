import Icon from "../icon";
import { useState, MouseEvent, CSSProperties, Dispatch, SetStateAction, useEffect, useRef } from "react";
import "@/styles/components/checkbox.css";
import { areEquals } from "@/lib/utils";
import { useFormContext } from "./dataForm";

export default function Checkbox({
    initialValue,
    children,
    className,
    busy,
    disabled,
    fieldName,
    onClick,
    style
}: Readonly<{
    initialValue?: boolean,
    children?: React.ReactNode,
    className?: string,
    busy?: boolean,
    disabled?: boolean,
    fieldName?: string,
    onClick?: (event: MouseEvent<HTMLButtonElement>,
        checked: boolean, setChecked: Dispatch<SetStateAction<boolean>>,
        setBusy: Dispatch<SetStateAction<boolean>>) => void,
    style?: CSSProperties,
}>) {
    const [checked, setChecked] = useState(initialValue ?? false);
    const [lastInitialValue, setLastInitialValue] = useState<boolean>();
    const [busyState, setBusyState] = useState(busy ?? false);
    const { formReset = false, formDisabled = false, onFormChange, formLoading, registerField } = useFormContext();
    const isDisabled = disabled || formDisabled;
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle field registration
    useEffect(() => registerField(fieldName, inputRef), [inputRef.current]);

    const clickEvent = (event: MouseEvent<HTMLButtonElement>) => {
        if (!isDisabled && !busyState) {
            let value = checked;
            setChecked(prev => {
                value = !prev;
                return value;
            });
            onFormChange(fieldName, value);
            if (onClick != undefined) onClick(event, value, setChecked, setBusyState);
        }
    }

    useEffect(() => {
        if (initialValue !== undefined && (!areEquals(lastInitialValue, initialValue) || formReset)) {
            setChecked(initialValue);
        } else if (formReset) {
            setChecked(false);
            onFormChange(fieldName);
        }
        setLastInitialValue(initialValue);
    }, [initialValue, formReset])

    const isBusy = busyState || formLoading || busy

    return <div className="checkbox-container">
        <button type="button" onClick={clickEvent} style={{ ...style }}
            disabled={isDisabled} className={"checkbox rounded-m horizontal-list" + " " + (className ?? "")}>
            <div className={`box rounded-s ${checked ? " checked" : ""}`}>
                {isBusy
                    ? <Icon className="medium loading-animation" icon="PROGRESS_ACTIVITY" />
                    : <Icon className="medium" icon={checked ? "CHECK" : "CLOSE"} />
                }

            </div>
            <span className="title normal" style={{ fontSize: '15px' }}>{children}</span>
        </button>
        <input tabIndex={-1}
            className="suppressed-input"
            type="text"
            name={fieldName}
            value={String(checked)}
            ref={inputRef} />
    </div>
}