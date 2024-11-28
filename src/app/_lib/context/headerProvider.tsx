import { createContext, useContext, useState } from "react";

interface HeaderUpdateType {
    updateHeader: boolean;
    setUpdateHeader: (value: boolean) => void;
}

const HeaderContext = createContext<HeaderUpdateType | undefined>(undefined);

export function HeaderProvider ({children}: Readonly<{children: React.ReactNode}>) {
    const [updateHeader, setUpdateHeader] = useState(false);
    const setUpdate = (value: boolean) => setUpdateHeader(value);
    return <HeaderContext.Provider value={{updateHeader, setUpdateHeader}}>{children}</HeaderContext.Provider>;
};

export const useHeaderUpdate = () => {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error("useHeaderUpdate must be used within a HeaderProvider");
    }
    return context;
};