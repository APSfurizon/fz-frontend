import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import { isNumeric } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"

type GalleryMediaCallback = (current: GalleryUploadedMedia) => GalleryUploadedMedia | undefined

type GalleryContextType = {
    medias: Map<number, GalleryUploadedMedia>;
    setGalleryMedias: React.Dispatch<React.SetStateAction<Map<number, GalleryUploadedMedia>>>;
    /** Closes the media modal, empties the medias map, its selections and  */
    onRefresh: () => void;
    openMedia(id: number): void;
    closeMedia(): void;
    currentMedia?: Partial<GalleryUploadedMedia>;
    modalOpen: boolean;
    goNext(): void;
    goBack(): void;
    getNextData: () => Promise<GalleryUploadedMedia[]>,
    galleryLoading: boolean;
    ended: boolean;
    selectedMediaIdMap: Set<number>;
    onSelect: (id: number, selected: boolean) => void;
    setSelection: React.Dispatch<React.SetStateAction<Set<number>>>;
}

const GalleryContext = createContext<GalleryContextType>(undefined as any);

type GalleryProviderProps = {
    children?: React.ReactNode,
    getNextData: (currentCursor: number) => Promise<GalleryUploadedMedia[]>
}

const MEDIA_SEARCH_PARAM = "media";

export function GalleryProvider(props: Readonly<GalleryProviderProps>) {
    const router = useRouter();
    const currentPath = usePathname();

    // Data holding logic
    const [loading, setLoading] = useState(false);
    const [medias, setGalleryMedias] = useState<Map<number, GalleryUploadedMedia>>(new Map());
    const [ended, setEnded] = useState(false);
    /** The key of the oldest media uploaded */
    const minKey = useMemo(() => medias.keys().reduce((prev, next) => Math.min(prev, next), Number.MAX_SAFE_INTEGER), [medias]);

    const onRefresh = useCallback(() => {
        closeMedia();
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

    // Selection logic
    const [selection, setSelection] = useState<Set<number>>(new Set());

    const onSelect = useCallback((id: number, selected: boolean) => {
        setSelection(prev => {
            const next = new Set(prev);
            if (selected) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    }, [medias])

    // Modal handling
    const [modalOpen, setModalOpen] = useState(false);
    const [currentMedia, setCurrentMedia] = useState<Partial<GalleryUploadedMedia>>();

    const openMedia = useCallback((id: number) => {
        setCurrentMedia(medias.get(id));
        setModalOpen(true);
        updateSelectedMediaParam(id);
    }, [medias]);

    const closeMedia = useCallback(() => {
        setModalOpen(false);
    }, []);

    const getNextMedia = useCallback((current?: Partial<GalleryUploadedMedia>) => {
        if (!current) return Promise.resolve(undefined);
        const keys = [...medias.keys()].sort((a, b) => b - a);
        const toReturn = medias.get(keys[keys.indexOf(current.id!) + 1]);
        return toReturn
            ? Promise.resolve(toReturn)
            : getNextData().then(result => result[0])
    }, [medias]);

    const getPreviousMedia = useCallback((current?: Partial<GalleryUploadedMedia>) => {
        if (!current) return Promise.resolve(undefined);
        const keys = [...medias.keys()].sort((a, b) => b - a);
        return Promise.resolve(medias.get(keys[keys.indexOf(current.id!) - 1]));
    }, [medias]);

    const goNext = useCallback(() => {
        if (!currentMedia?.id) return;
        getNextMedia(currentMedia)
            .then(newValue => setCurrentMedia(prev => newValue ?? prev));
    }, [getNextMedia, currentMedia]);

    const goBack = useCallback(() => {
        if (!currentMedia?.id) return;
        getPreviousMedia(currentMedia)
            .then(newValue => setCurrentMedia(prev => newValue ?? prev));
    }, [getPreviousMedia, currentMedia]);

    // Search params handling
    const params = useSearchParams();

    const updateSelectedMediaParam = (mediaId: number) => {
        const newParams = new URLSearchParams(params);
        newParams.delete(MEDIA_SEARCH_PARAM);
        newParams.append(MEDIA_SEARCH_PARAM, String(mediaId));
        console.log(currentPath + `?${newParams.toString()}`);
        router.push(currentPath + `?${newParams.toString()}`);
    }

    useEffect(() => {
        if (params.has(MEDIA_SEARCH_PARAM)) {
            const value = params.get(MEDIA_SEARCH_PARAM);
            if (!value || !isNumeric(value)) return;
            const id = parseInt(value);
            setCurrentMedia({ id });
            setModalOpen(true);
        }
    }, []);

    return <GalleryContext.Provider value={{
        medias,
        setGalleryMedias,
        onRefresh,
        currentMedia,
        openMedia,
        closeMedia,
        modalOpen,
        goNext,
        goBack,
        galleryLoading: loading,
        selectedMediaIdMap: selection,
        ended,
        getNextData,
        onSelect,
        setSelection
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