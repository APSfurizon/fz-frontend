import { createContext, RefObject, useContext, useEffect, useRef, useState } from "react";
import { UserDisplayAction, UserDisplayResponse } from "@/lib/api/user";
import { runRequest } from "@/lib/api/global";

interface UserUpdateType {
    updateUser: boolean;
    setUpdateUser: (value: boolean) => void;
    userDisplay?: UserDisplayResponse,
    setUserDisplay: (value?: UserDisplayResponse) => void;
    userLoading: boolean,
    userDisplayRef: RefObject<UserDisplayResponse | undefined>;
}

const UserContext = createContext<UserUpdateType>(undefined as any);

export function HeaderProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [updateUser, setUpdateUser] = useState(false);
    const [userLoading, setUserLoading] = useState(true);
    const [userDisplay, setUserDisplay] = useState<UserDisplayResponse>();
    const userDisplayRef = useRef<typeof userDisplay>(userDisplay);

    const handleUserUpdate = (doUpdate: boolean) => {
        setUserLoading(true);
        if (doUpdate) {
            runRequest({ action: new UserDisplayAction() })
                .then((data) => {
                    setUserDisplay(data);
                    userDisplayRef.current = data;
                }).catch(() => { /* TODO: Handle user login errors */ })
                .finally(() => setUserLoading(false));
            setUpdateUser(false);
        }
    }

    useEffect(() => {
        handleUserUpdate(updateUser);
    }, [updateUser]);

    useEffect(() => {
        handleUserUpdate(true);
    }, []);

    return <UserContext.Provider value={{ updateUser, setUpdateUser, userDisplay, setUserDisplay, userLoading, userDisplayRef }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useHeaderUpdate must be used within a HeaderProvider");
    }
    return context;
};