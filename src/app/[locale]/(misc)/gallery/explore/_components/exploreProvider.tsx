import { ExploreEventApiAction, ExploreEventsApiAction, ExplorePhotographerApiAction, ExplorePhotographersApiAction } from "@/lib/api/gallery/explore/api";
import { CachedFullMedias } from "@/lib/api/gallery/explore/main";
import { ExploreEvent, ExplorePhotographer } from "@/lib/api/gallery/explore/type";
import { GalleryUploadedMediaStatus } from "@/lib/api/gallery/types";
import { runRequest } from "@/lib/api/global";
import { buildSearchParams } from "@/lib/utils";
import { Leastwise } from "@/lib/utils/types";
import { useParams, useSearchParams } from "next/navigation";
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from "react";

class ExploreFilter {
    event: ExploreEvent | null;
    photographer: ExplorePhotographer | null;
    status: GalleryUploadedMediaStatus | null;

    constructor(prev: ExploreFilter) {
        this.event = prev.event;
        this.photographer = prev.photographer;
        this.status = prev.status;
    }
}

type FilterSetterBaseData = { eventId: number | null, photographerId: number | null, status: GalleryUploadedMediaStatus | null };
export type FilterSetterData = Partial<FilterSetterBaseData>;
type FilterSetterSearchData = Leastwise<FilterSetterBaseData>;

interface ExploreProviderType {
    events: Map<number, ExploreEvent>;
    photographers: Map<number, ExplorePhotographer>;
    setFilter(data: FilterSetterData): void;
    searchFilter(data: FilterSetterSearchData): void;
    currentFilter?: ExploreFilter,
    reloadData(): void;
    loading: boolean;
    cache: CachedFullMedias;
    showFilters: boolean;
    setShowFilters: Dispatch<SetStateAction<boolean>>;
}

const ExploreContext = createContext<ExploreProviderType>(undefined as any);

export function ExploreProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [events, setEvents] = useState<Map<number, ExploreEvent>>(new Map());
    const [photographers, setPhotographers] = useState<Map<number, ExplorePhotographer>>(new Map());

    const [currentFilter, setCurrentFilter] = useState<ExploreFilter>();

    const [loading, setLoading] = useState(false);

    const [cache] = useState(new CachedFullMedias());

    const [showFilters, setShowFilters] = useState(false);

    const setFilter = useCallback((data: FilterSetterData) => {
        setCurrentFilter(prev => new ExploreFilter({
            ...prev,
            event: (
                data.eventId
                    ? events.get(data.eventId) ?? prev?.event
                    : data.eventId === null ? null : prev?.event
            ) ?? null,
            photographer: (
                data.photographerId
                    ? photographers.get(data.photographerId) ?? prev?.photographer
                    : data.photographerId === null ? null : prev?.photographer
            ) ?? null,
            status: (
                data.status
                    ? data.status
                    : data.status === null ? null : prev?.status
            ) ?? null
        }));


    }, [events, photographers]);

    // TODO: understand with usePathname and useParams
    const searchFilter = useCallback((data: FilterSetterSearchData) => {
        const eventSearch = data.eventId !== undefined && data.eventId !== null
            ? runRequest({
                action: new ExploreEventApiAction(),
                pathParams: { "id": data.eventId }
            })
            : Promise.resolve(data.eventId);
        const photographerSearch = data.photographerId !== undefined && data.photographerId !== null
            ? runRequest({
                action: new ExplorePhotographerApiAction(),
                pathParams: { "id": data.photographerId }
            })
            : Promise.resolve(data.photographerId);
        setLoading(true);
        return Promise.all([eventSearch, photographerSearch, Promise.resolve(data.status)])
            .then(([event, photographer, status]) => {
                setCurrentFilter(prev => new ExploreFilter({
                    event: event == null ? null : (event ?? prev?.event ?? null),
                    photographer: photographer == null ? null : (photographer ?? prev?.photographer ?? null),
                    status: status == null ? null : (status ?? prev?.status ?? null)
                }))
            }).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!currentFilter) return;
        reloadData();
    }, [currentFilter]);

    const reloadData = () => {
        setLoading(true);
        Promise.all([
            runRequest({
                action: new ExploreEventsApiAction(),
                searchParams: buildSearchParams({ "photographerUserId": String(currentFilter?.photographer?.user.userId ?? "") })
            }),
            runRequest({
                action: new ExplorePhotographersApiAction(),
                searchParams: buildSearchParams({ "eventId": String(currentFilter?.event?.event.id ?? "") })
            }),
        ]).then(([eventsRes, photographersRes]) => {
            setEvents(prev => {
                const next = new Map();
                for (const evt of eventsRes.events) {
                    next.set(evt.event.id, evt);
                }
                return next;
            });
            setPhotographers(prev => {
                const next = new Map();
                for (const pht of photographersRes.photographers) {
                    next.set(pht.user.userId, pht);
                }
                return next;
            })
        }).finally(() => setLoading(false));
    }

    // History management
    const pathParams = useParams();
    const searchParams = useSearchParams();

    return <ExploreContext.Provider value={{
        events,
        photographers,
        setFilter,
        searchFilter,
        currentFilter,
        reloadData,
        loading,
        cache,
        showFilters,
        setShowFilters
    }}>
        {children}
    </ExploreContext.Provider>
}

export function useExplore() {
    const context = useContext(ExploreContext);
    if (!context) {
        throw new Error("useExplore must be used within a ExploreProvider");
    }
    return context;
}