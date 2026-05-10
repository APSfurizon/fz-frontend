import { CSSProperties, MouseEvent, useEffect, useMemo, useState } from "react";
import "@/styles/components/button.css";
import Icon, { MaterialIcon } from "../icon";
import { useFormContext } from "./dataForm";

type FpButtonProps = {
    children?: React.ReactNode,
    icon?: MaterialIcon,
    style?: CSSProperties,
    className?: string,
    busy?: boolean,
    onClick?: React.MouseEventHandler,
    disabled?: boolean,
    title?: string,
    type?: "submit" | "reset" | "button",
    debounce?: number
}

export default function FpButton(props: Readonly<FpButtonProps>) {
    const formContext = useFormContext();
    const finalBusy = useMemo(() => formContext.formLoading || props.busy, [formContext.formLoading, props.busy])
    const [disabledState, setDisabledState] = useState(props.disabled);
    const iconPresent = props.icon != undefined;
    const onClickEvent = (e: MouseEvent<HTMLButtonElement>) => {
        if (finalBusy || disabledState || !props.onClick) return;
        if (props.debounce && !disabledState) {
            setDisabledState(true);
            setTimeout(() => setDisabledState(false), props.debounce);
        }
        return props.onClick(e);
    }

    useEffect(() => setDisabledState(props.disabled), [props.disabled]);

    const isCooldown = !finalBusy && props.debounce !== undefined && disabledState && !props.disabled;

    return (
        <button type={props.type} onClick={onClickEvent}
            title={props.title}
            disabled={finalBusy || disabledState}
            className={"button rounded-m" + " " + (props.className ?? "")}
            style={{ ...props.style, paddingRight: iconPresent ? '0.5em' : undefined }}>
            {finalBusy && <Icon className={`medium loading-animation`} icon="PROGRESS_ACTIVITY" />}
            {!finalBusy && isCooldown && <Icon className={`medium`} icon="SNOOZE" />}
            {!finalBusy && !isCooldown && iconPresent && <Icon className={`medium`} icon={props.icon} />}
            {props.children && props.icon && <div className="spacer"></div>}
            {props.children && <span className="title normal spacer" style={{ fontSize: '15px', textAlign: "left" }}>
                {props.children}
            </span>}
        </button>
    )
}