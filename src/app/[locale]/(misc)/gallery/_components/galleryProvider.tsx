import React, { createContext, useCallback, useContext, useMemo, useState } from "react"

interface GalleryContextType {
    // TODO: create upload media type
    openMedia(media: any): void;
    closeMedia(): void;
    currentMedia: any;
    modalOpen: boolean;
}

const GalleryContext = createContext<GalleryContextType>(undefined as any);

export function GalleryProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [currentMedia, setCurrentMedia] = useState<any>();

    const openMedia = useCallback((media: any) => {
        setCurrentMedia(media);
    }, []);

    const closeMedia = useCallback(() => setCurrentMedia(undefined), []);

    const modalOpen = useMemo(() => !!currentMedia, [currentMedia]);

    return <GalleryContext.Provider value={{ currentMedia, openMedia, closeMedia, modalOpen }}>
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