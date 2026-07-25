import { CSSProperties, MouseEvent, useEffect, useMemo, useState } from "react";
import "@/styles/components/button.scss";
import Icon, { MaterialIcon } from "../icon";
import { useFormContext } from "./dataForm";
import { OneOf } from "@/lib/utils/types";

type FpButtonProps = {
  children?: React.ReactNode;
  icon?: MaterialIcon;
  iconClass?: string;
  style?: CSSProperties;
  className?: string;
  busy?: boolean;
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
  title?: string;
  type?: "submit" | "reset" | "button";
  debounce?: number;
} & OneOf<{
  iconButton?: boolean;
}> &
  OneOf<{
    success?: boolean;
    danger?: boolean;
    off?: boolean;
  }>;

export default function FpButton(props: Readonly<FpButtonProps>) {
  const formContext = useFormContext();
  const finalBusy = useMemo(() => formContext.formLoading || props.busy, [formContext.formLoading, props.busy]);
  const [disabledState, setDisabledState] = useState(props.disabled);
  const iconPresent = props.icon != undefined;
  const onClickEvent = (e: MouseEvent<HTMLButtonElement>) => {
    if (finalBusy || disabledState || !props.onClick) return;
    if (props.debounce && !disabledState) {
      setDisabledState(true);
      setTimeout(() => setDisabledState(false), props.debounce);
    }
    return props.onClick(e);
  };

  useEffect(() => setDisabledState(props.disabled), [props.disabled]);

  const isCooldown = !finalBusy && props.debounce !== undefined && disabledState && !props.disabled;

  return (
    <button
      type={props.type ?? "button"}
      onClick={onClickEvent}
      title={props.title}
      disabled={finalBusy || disabledState}
      className={[
        "fp-button",
        "rounded-m",
        props.iconButton ? "fp-button--icon" : "",
        props.className ?? "",
        props.success ? "fp-button--success" : "",
        props.danger ? "fp-button--danger" : "",
        finalBusy || disabledState || props.off ? "fp-button--off" : "",
      ].join(" ")}
      style={{ ...props.style, paddingRight: iconPresent && !props.iconButton ? "0.5em" : undefined }}
    >
      {finalBusy && (
        <Icon className={[props.iconClass ?? "medium", "loading-animation"].join(" ")} icon="PROGRESS_ACTIVITY" />
      )}
      {!finalBusy && isCooldown && <Icon className={[props.iconClass ?? "medium"].join(" ")} icon="SNOOZE" />}
      {!finalBusy && !isCooldown && iconPresent && (
        <Icon className={[props.iconClass ?? "medium"].join(" ")} icon={props.icon} />
      )}
      {props.children && props.icon && <div className="spacer"></div>}
      {props.children && (
        <span className="title normal spacer" style={{ fontSize: "15px", textAlign: "left" }}>
          {props.children}
        </span>
      )}
    </button>
  );
}
