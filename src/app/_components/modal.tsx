import { ChangeEvent, CSSProperties, KeyboardEvent, EventHandler, useEffect } from "react";
import Icon, { ICONS } from "./icon";
import "../styles/components/modal.css";
import { useTranslations } from "next-intl";

export default function Modal ({children, className, onClose, open, overlayClassName, overlayStyle, showHeader=true, style, title }: Readonly<{
    children?: React.ReactNode, className?: string, onClose: Function, open: boolean, overlayClassName?: string, overlayStyle?: CSSProperties, showHeader?: boolean, style?: CSSProperties, title?: string;
}>) {
    const t = useTranslations("components");
    return <>
        <div className={`modal-overlay ${overlayClassName ?? ""} ${open ? "open" : ""}`}></div>
        <div className={`modal-dialog rounded-s vertical-list ${className ?? ""} ${open ? "open" : ""}`}>
            {
                showHeader && (
                    <div className="modal-header horizontal-list">
                        <span className="header-title title bold medium">{title}</span>
                        <a className="header-close" onClick={(e)=>onClose(e)} title={t("modal.close")}><Icon iconName={ICONS.CANCEL}></Icon></a>
                    </div>
                )
            }
            {children}
        </div>
    </>
}