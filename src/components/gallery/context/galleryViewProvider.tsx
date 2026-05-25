import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import { isNumeric } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useGallery } from "./galleryProvider";

type GalleryViewContextType = {
    openMedia(id: number): void;
    closeMedia(): void;
    currentMediaId?: number;
    goNext(): void;
    goBack(): void;
}

const GalleryViewContext = createContext<GalleryViewContextType>(undefined as any);

type GalleryViewProviderProps = {
    children?: React.ReactNode;
}

const MEDIA_SEARCH_PARAM = "media";
export function GalleryViewProvider(props: Readonly<GalleryViewProviderProps>) {

    const [currentMediaId, setCurrentMediaId] = useState<number>();
    const { medias, getNextData } = useGallery();

    // Search params handling
    const params = useSearchParams();

    const updateSelectedMediaParam = (mediaId?: number) => {
        const newParams = new URLSearchParams(params);
        newParams.delete(MEDIA_SEARCH_PARAM);
        if (mediaId) {
            newParams.append(MEDIA_SEARCH_PARAM, String(mediaId));
        }
        window.history.replaceState({}, '', newParams.size > 0 ? `?${newParams.toString()}` : window.location.pathname);
    }

    // Only on load for shareability
    useEffect(() => {
        if (params.has(MEDIA_SEARCH_PARAM)) {
            const value = params.get(MEDIA_SEARCH_PARAM);
            if (!value || !isNumeric(value)) return;
            const id = parseInt(value);
            if (currentMediaId !== id) {
                setCurrentMediaId(id);
            }
        } else {
            setCurrentMediaId(undefined);
        }
    }, []);

    useEffect(() => {
        updateSelectedMediaParam(currentMediaId);
    }, [currentMediaId]);

    const openMedia = (id: number) => {
        setCurrentMediaId(id);
    };

    const closeMedia = () => {
        setCurrentMediaId(undefined);
    };

    const getNextMedia = (current?: number) => {
        if (!current) return Promise.resolve(undefined);
        const keys = [...medias.keys()].sort((a, b) => b - a);
        const toReturn = keys[keys.indexOf(current) + 1];
        return toReturn
            ? Promise.resolve(toReturn)
            : getNextData().then(result => result[0]?.id)
    };

    const getPreviousMedia = (current?: number) => {
        if (!current) return Promise.resolve(undefined);
        const keys = [...medias.keys()].sort((a, b) => b - a);
        return Promise.resolve(keys[keys.indexOf(current) - 1]);
    };

    const goNext = () => {
        if (!currentMediaId) return;
        getNextMedia(currentMediaId)
            .then(newValue => {
                if (newValue) {
                    setCurrentMediaId(newValue);
                }
            });
    };

    const goBack = () => {
        if (!currentMediaId) return;
        getPreviousMedia(currentMediaId)
            .then(newValue => {
                if (newValue) {
                    setCurrentMediaId(newValue);
                }
            });
    };

    return <GalleryViewContext.Provider value={{
        openMedia,
        closeMedia,
        goNext,
        goBack,
        currentMediaId
    }}>
        {props.children}
    </GalleryViewContext.Provider>
}

export function useGalleryView() {
    const context = useContext(GalleryViewContext);
    if (!context) {
        throw new Error("useGalleryView must be used within a GalleryViewProvider")
    }
    return context;
}