import { createContext, useContext, useState } from "react";
import { MaterialIcon } from "../icon";

interface ModalUpdateType {
    isOpen: boolean;
    icon?: MaterialIcon;
    title?: string;
    zIndex: number;
    modalChildren: React.ReactNode;
    showModal: (title: string, data: React.ReactNode, icon?: MaterialIcon, zIndex?: number) => void;
    hideModal: () => void;
}

const ModalContext = createContext<ModalUpdateType>(undefined as any);

export function ModalProvider ({children}: Readonly<{children: React.ReactNode}>) {
    const [isOpen, setOpen] = useState(false);
    const [icon, setIcon] = useState<MaterialIcon>();
    const [title, setModalTitle] = useState<string>();
    const [zIndex, setZIndex] = useState<number>(500);
    const [modalChildren, setModalChildren] = useState<React.ReactNode>();
    const showModal = (title: string, data: React.ReactNode, icon?: MaterialIcon, zIndex?: number) => {
        setModalTitle(title);
        setIcon(icon);
        setModalChildren(data);
        setZIndex(zIndex ?? 500);
        setOpen(true);
    }
    const hideModal = () => setOpen(false);
    return <ModalContext.Provider value={{isOpen, title, icon, modalChildren, zIndex, showModal, hideModal}}>{children}</ModalContext.Provider>;
};

export const useModalUpdate = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModalUpdate must be used within a ModalProvider");
    }
    return context;
};