import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react"

type GalleryMediaCallback = (current: GalleryUploadedMedia) => GalleryUploadedMedia | undefined

type GalleryContextType = {
    medias: Map<number, GalleryUploadedMedia>;
    setGalleryMedias: React.Dispatch<React.SetStateAction<Map<number, GalleryUploadedMedia>>>;
    /** Closes the media modal, empties the medias map, its selections and  */
    onRefresh: () => void;
    getNextData: () => Promise<GalleryUploadedMedia[]>,
    galleryLoading: boolean;
    ended: boolean;
}

const GalleryContext = createContext<GalleryContextType>(undefined as any);

type GalleryProviderProps = {
    children?: React.ReactNode;
    getNextData: (currentCursor: number) => Promise<GalleryUploadedMedia[]>;
}

export function GalleryProvider(props: Readonly<GalleryProviderProps>) {

    // Data holding logic
    const [loading, setLoading] = useState(false);
    const [medias, setGalleryMedias] = useState<Map<number, GalleryUploadedMedia>>(new Map());
    const [ended, setEnded] = useState(false);
    /** The key of the oldest media uploaded */
    const minKey = useMemo(() => medias.keys().reduce((prev, next) => Math.min(prev, next), Number.MAX_SAFE_INTEGER), [medias]);

    const onRefresh = useCallback(() => {
        //TODO: closeMedia();
        setGalleryMedias(new Map());
        setEnded(false);
    }, []);

    const getNextData = () => {
        if (ended) return Promise.resolve([]);
        setLoading(true);
        return props.getNextData(minKey)
            .then(result => {
                setGalleryMedias(prev => {
                    const next = new Map(prev);
                    result.forEach(r => next.set(r.id, r));
                    return next;
                });
                setEnded(!result.length);
                return Promise.resolve(result);
            }).finally(() => setLoading(false));
    }

    return <GalleryContext.Provider value={{
        medias,
        setGalleryMedias,
        onRefresh,
        galleryLoading: loading,
        ended,
        getNextData
    }}>
        {props.children}
    </GalleryContext.Provider>
}

export function useGallery() {
    const context = useContext(GalleryContext);
    if (!context) {
        throw new Error("useGallery must be used within a GalleryProvider")
    }
    return context;
}