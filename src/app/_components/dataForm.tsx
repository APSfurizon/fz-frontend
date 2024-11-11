import Icon, { ICONS } from "./icon";
import { useState, MouseEvent, CSSProperties, FormEvent } from "react";
import "../styles/components/dataForm.css";

export default function DataForm ({callback, children, className, disabled, endpoint, method="POST", style}: Readonly<{
    callback?: Function,
    children?: React.ReactNode,
    className?: string,
    disabled?: boolean,
    endpoint?: string,
    method?: string,
    style?: CSSProperties,
  }>) {
    const [loading, setLoading] = useState(false);

    const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }
    
    return <>
        <form className={`data-form vertical-list`} method={method} action={endpoint} aria-disabled={disabled} onSubmit={onFormSubmit}>
            {children}
        </form>
    </>
}