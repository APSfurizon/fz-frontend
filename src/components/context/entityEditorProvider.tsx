import { resultSelf } from "@/lib/utils";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";

interface EntityEditorType<T, U> {
    entity: T;
    setEntity: (newEntity: T) => void;
    viewEntity: U,
    setViewEntity: Dispatch<SetStateAction<U>>;
    entityChanged: boolean;
    loading: boolean;
    saveEntity: (entity: U) => void;
}

const EntityEditorContext = createContext<EntityEditorType<any, any>>(undefined as any);

/**
 * EntityEditorProvider<T, U, V>
 * @type T - the view object, the one we receive in input to get the first props.
 * @type U - the store object, which model is in between holding temporary info to transform in the output type before submission.
 * @returns 
 */
export function EntityEditorProvider<T, U> ({
    children,
    initialViewEntity,
    initialStoreEntity,
    viewToStore=resultSelf<T, U>,
    loading,
    onSave
}: Readonly<{
    children: React.ReactNode,
    initialViewEntity?: T,
    initialStoreEntity?: U,
    viewToStore?: (view: T) => U,
    loading: boolean,
    onSave: (entity: U) => Promise<T>
}>) {
    const [entity, setEntityValue] = useState<U>(initialStoreEntity as U);
    const [viewEntity, setViewEntity] = useState<T>(initialViewEntity as T);
    const setEntity = (newEntity: any) => {
        setEntityValue(newEntity);
        setEntityChanged(true);
    }
    const [entityChanged, setEntityChanged ] = useState(false);

    useEffect(() => {
        setEntityValue (initialStoreEntity as U);
    }, [initialStoreEntity]);

    useEffect(() => {
        if (!initialViewEntity) return;
        setViewEntity(initialViewEntity);
    }, [initialViewEntity]);

    useEffect(() => {
        if (!viewEntity) return;
        const output = viewToStore(viewEntity);
        setEntityValue(output);
        setEntityChanged(false);
    }, [viewEntity]);

    const saveEntity = (entity: U) => {
        onSave(entity)
        .then((role)=>setViewEntity(role))
        .catch((err)=>console.warn(`Entity editor save failed with: ${JSON.stringify(err)}`))
    }

    const values = {entity, setEntity, entityChanged, viewEntity, setViewEntity, loading, saveEntity};
    return <EntityEditorContext.Provider value={values}>{children}</EntityEditorContext.Provider>
}

export function useEntityEditor<T, U> () {
    const context = useContext<EntityEditorType<T, U>>(EntityEditorContext);
    if (!context) {
        throw 'EntityEditor context missing';
    }
    return context;
}