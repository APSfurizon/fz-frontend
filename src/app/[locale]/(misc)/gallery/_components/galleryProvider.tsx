import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"

type GalleryMediaCallback = (current: GalleryUploadedMedia) => GalleryUploadedMedia | undefined

type GalleryContextType = {
    medias: Map<number, GalleryUploadedMedia>;
    setModalMedias: React.Dispatch<React.SetStateAction<Map<number, GalleryUploadedMedia>>>;
    openMedia(id: number): void;
    closeMedia(): void;
    currentMedia?: GalleryUploadedMedia;
    modalOpen: boolean;
    goNext(): void,
    goBack(): void
}

const GalleryContext = createContext<GalleryContextType>(undefined as any);

export function GalleryProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [medias, setModalMedias] = useState<Map<number, GalleryUploadedMedia>>(new Map());
    const [modalOpen, setModalOpen] = useState(false);
    const [currentMedia, setCurrentMedia] = useState<GalleryUploadedMedia>();

    const openMedia = useCallback((id: number) => {
        setCurrentMedia(medias.get(id));
        setModalOpen(true);
    }, [medias]);

    const closeMedia = useCallback(() => {
        setModalOpen(false);
    }, []);

    const getNextMedia = useCallback((current?: GalleryUploadedMedia) => {
        if (!current) return undefined;
        const keys = [...medias.keys()].sort((a, b) => b - a);

        return medias.get(keys[keys.indexOf(current.id) + 1])
    }, [medias]);

    const getPreviousMedia = useCallback((current?: GalleryUploadedMedia) => {
        if (!current) return undefined;
        const keys = [...medias.keys()].sort((a, b) => b - a);

        return medias.get(keys[keys.indexOf(current.id) - 1])
    }, [medias]);

    const goNext = useCallback(() => {
        setCurrentMedia(prev => getNextMedia(prev) ?? prev);
    }, [getNextMedia]);

    const goBack = useCallback(() => {
        setCurrentMedia(prev => getPreviousMedia(prev!) ?? prev);
    }, [getPreviousMedia]);

    return <GalleryContext.Provider value={{ medias, setModalMedias, currentMedia, openMedia, closeMedia, modalOpen, goNext, goBack }}>
        {children}
    </GalleryContext.Provider>
}

export function useGallery() {
    const context = useContext(GalleryContext);
    if (!context) {
        throw new Error("useGallery must be used within a GalleryProvider")
    }
    return context;
}