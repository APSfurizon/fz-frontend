"use client"
import { createContext, CSSProperties, MouseEvent, useContext, useEffect, useMemo, useState } from "react";
import Icon, { MaterialIcon } from "./icon";
import "@/styles/components/modal.css";
import { useTranslations } from "next-intl";
import ReactDOM from "react-dom";

// Context management
interface ModalUpdate {
    loading: boolean,
    setLoading: (b: boolean) => void
}

const ModalContext = createContext<ModalUpdate | undefined>(undefined);

export const useModalContext: () => ModalUpdate = () => {
    const context = useContext(ModalContext);
    if (!context) {
        return {
            loading: false,
            setLoading: () => {}
        };
    }
    return context;
};

export default function Modal({ children, className, icon, onClose, busy, open, overlayClassName, overlayStyle, showHeader = true, style, title, zIndex = 500 }: Readonly<{
    children?: React.ReactNode, className?: string, icon?: MaterialIcon, onClose: (e: MouseEvent) => void, busy?: boolean, open: boolean, overlayClassName?: string, overlayStyle?: CSSProperties, showHeader?: boolean, style?: CSSProperties, title?: string, zIndex?: number;
}>) {
    const t = useTranslations("components");
    const [container, setContainer] = useState<HTMLElement>();
    const [loading, setLoading] = useState (false);

    const definitiveLoading = useMemo(() => busy || loading, [busy, loading]);

    useEffect(() => {
        setContainer(globalThis?.document.getElementById("portal-root") ?? undefined);
    }, []);

    return container ? ReactDOM.createPortal(<>
        <div className={`modal-overlay ${overlayClassName ?? ""} ${open ? "open" : ""}`}
            style={{ zIndex, ...overlayStyle }}></div>
        <div className={`modal-dialog rounded-s vertical-list ${className ?? ""} ${open ? "open" : ""}`}
            style={{ zIndex, ...style }}>
            {
                showHeader && (
                    <div className="modal-header horizontal-list gap-2mm">
                        {icon && <Icon style={{ marginRight: ".25em" }} icon={icon}/>}
                        <p className="header-title title bold medium">{title}</p>
                        <div className="spacer"></div>
                        {definitiveLoading
                            ? <Icon className="loading-animation" icon="PROGRESS_ACTIVITY"/>
                            : <a className="header-close" onClick={(e) => !definitiveLoading && onClose(e)} title={t("modal.close")}>
                                <Icon icon="CANCEL" />
                            </a>
                        }
                    </div>
                )
            }
            <ModalContext.Provider value={{
                loading: loading,
                setLoading: setLoading
            }}>
                {children}
            </ModalContext.Provider>
        </div>
    </>, container) : <></>;
}