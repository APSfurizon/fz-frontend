import Icon, { ICONS } from "./icon";
import { useState, MouseEvent, CSSProperties, FormEvent } from "react";
import { useTranslations } from "next-intl";
import Button from "./button";
import "../styles/components/dataForm.css";

export interface SaveButtonData {
    text: string,
    iconName: string
}

export default function DataForm ({callback, children, className, disabled, endpoint, method="POST", style, saveButton}: Readonly<{
    callback?: Function,
    children?: React.ReactNode,
    className?: string,
    disabled?: boolean,
    endpoint?: string,
    method?: string,
    style?: CSSProperties,
    saveButton?: SaveButtonData
  }>) {
    const t = useTranslations('components');
    if (saveButton === undefined) saveButton = {
        text: t('dataForm.save'),
        iconName: ICONS.SAVE
    };
    
    const [loading, setLoading] = useState(false);

    const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }
    
    return <>
        <form className={`data-form vertical-list`} method={method} action={endpoint} aria-disabled={disabled} onSubmit={onFormSubmit}>
            {children}
            <div className="toolbar-bottom">
                <Button iconName={saveButton.iconName} busy={loading}>{saveButton.text}</Button>
            </div>
        </form>
    </>
}