import { createContext, useContext, useState } from "react";

interface ModalUpdateType {
    isOpen: boolean;
    title?: string;
    modalChildren: React.ReactNode;
    showModal: (title: string, children: React.ReactNode) => void;
    hideModal: () => void;
}

const ModalContext = createContext<ModalUpdateType | undefined>(undefined);

export function ModalProvider ({children}: Readonly<{children: React.ReactNode}>) {
    const [isOpen, setOpen] = useState(false);
    const [title, setModalTitle] = useState<string>();
    const [modalChildren, setModalChildren] = useState<React.ReactNode>();
    const showModal = (title: string, data: React.ReactNode) => {
        setModalTitle(title);
        setModalChildren(data);
        setOpen(true);
    }
    const hideModal = () => setOpen(false);
    return <ModalContext.Provider value={{isOpen, title, modalChildren, showModal, hideModal}}>{children}</ModalContext.Provider>;
};

export const useModalUpdate = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModalUpdate must be used within a ModalProvider");
    }
    return context;
};