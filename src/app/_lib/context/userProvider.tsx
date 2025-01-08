import { createContext, useContext, useEffect, useState } from "react";
import { UserData, UserDisplayAction, UserDisplayResponse } from "../api/user";
import { runRequest } from "../api/global";

interface UserUpdateType {
    updateUser: boolean;
    setUpdateUser: (value: boolean) => void;
    userDisplay?: UserDisplayResponse,
    setUserDisplay: (value: UserDisplayResponse) => void;
    userLoading: boolean
}

const UserContext = createContext<UserUpdateType | undefined>(undefined);

export function HeaderProvider ({children}: Readonly<{children: React.ReactNode}>) {
    const [updateUser, setUpdateUser] = useState(false);
    const [userLoading, setUserLoading] = useState(false);
    const [userDisplay, setUserDisplay] = useState<UserDisplayResponse>();
    
    const handleUserUpdate = (doUpdate: boolean) => {
            setUserLoading(true);
            if (doUpdate) {
                runRequest(new UserDisplayAction()).then((data)=> {
                    setUserDisplay(data as UserDisplayResponse);
                })
                .catch(()=>{})
                .finally(()=>{
                    setUserLoading(false);
                });
                setUpdateUser(false);
            }
        }
    
        useEffect(()=> {
            handleUserUpdate(updateUser);
        }, [updateUser]);
    
        useEffect(()=> {
            handleUserUpdate(true);
        }, []);

    return <UserContext.Provider value={{updateUser, setUpdateUser, userDisplay, setUserDisplay, userLoading}}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useHeaderUpdate must be used within a HeaderProvider");
    }
    return context;
};