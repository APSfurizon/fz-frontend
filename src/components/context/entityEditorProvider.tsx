import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";

interface EntityEditorType<T, U> {
    entity: T;
    setEntity: (newEntity: T) => void;
    viewEntity: U,
    setViewEntity: Dispatch<SetStateAction<U>>;
    entityChanged: boolean;
}

const EntityEditorContext = createContext<EntityEditorType<any, any>>(undefined as any);

export function EntityEditorProvider<T, U> ({
    children,
    initialEntity,
    initialViewEntity,
    viewToOutput
}: Readonly<{
    children: React.ReactNode,
    initialEntity?: T,
    initialViewEntity?: U,
    viewToOutput: (view: U) => T
}>) {
    const [entity, setEntityValue] = useState<T>(initialEntity as T);
    const [viewEntity, setViewEntity] = useState<U>(initialViewEntity as U);
    const setEntity = (newEntity: any) => {
        setEntityValue(newEntity);
        setEntityChanged(true);
    }
    const [entityChanged, setEntityChanged ] = useState(false);

    useEffect(() => {
        setEntityValue (initialEntity as T);
    }, [initialEntity])

    useEffect(() => {
        if (!initialViewEntity) return;
        const output = viewToOutput(initialViewEntity);
        setEntityValue(output);
    }, [initialViewEntity])

    return <EntityEditorContext.Provider value={{entity, setEntity, entityChanged, viewEntity, setViewEntity}}>{children}</EntityEditorContext.Provider>
}

export function useEntityEditor<T, U> () {
    const context = useContext<EntityEditorType<T, U>>(EntityEditorContext);
    if (!context) {
        throw 'EntityEditor context missing';
    }
    return context;
}