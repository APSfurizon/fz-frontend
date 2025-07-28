"use client"
import { CSSProperties, useEffect, useState } from "react";
import Icon, { ICONS } from "./icon";
import "@/styles/components/modal.css";
import { useTranslations } from "next-intl";
import ReactDOM from "react-dom";

export default function Modal({ children, className, icon, onClose, busy, open, overlayClassName, overlayStyle, showHeader = true, style, title, zIndex = 500 }: Readonly<{
    children?: React.ReactNode, className?: string, icon?: string, onClose: Function, busy?: boolean, open: boolean, overlayClassName?: string, overlayStyle?: CSSProperties, showHeader?: boolean, style?: CSSProperties, title?: string, zIndex?: number;
}>) {
    const t = useTranslations("components");
    const [container, setContainer] = useState<HTMLElement>();

    useEffect(() => {
        setContainer(globalThis?.document.getElementById("portal-root") ?? undefined);
    }, []);

    return container ? ReactDOM.createPortal(<>
        <div className={`modal-overlay ${overlayClassName ?? ""} ${open ? "open" : ""}`} style={{ zIndex: zIndex, ...overlayStyle }}></div>
        <div className={`modal-dialog rounded-s vertical-list ${className ?? ""} ${open ? "open" : ""}`} style={{ zIndex: zIndex, ...style }}>
            {
                showHeader && (
                    <div className="modal-header horizontal-list gap-2mm">
                        {icon && <Icon style={{ marginRight: ".25em" }} icon={icon}></Icon>}
                        <p className="header-title title bold medium">{title}</p>
                        <div className="spacer"></div>
                        <a className="header-close" onClick={(e) => !busy && onClose(e)} title={t("modal.close")}><Icon icon={ICONS.CANCEL}></Icon></a>
                    </div>
                )
            }
            {children}
        </div>
    </>, container) : <></>;
}