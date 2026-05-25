import { useUser } from "@/components/context/userProvider";
import { ExploreEventApiAction, ExploreEventsApiAction, ExplorePhotographerApiAction, ExplorePhotographersApiAction } from "@/lib/api/gallery/explore/api";
import { ExploreUrl, parseExploreSlug } from "@/lib/api/gallery/explore/main";
import { ExploreEvent, ExplorePhotographer } from "@/lib/api/gallery/explore/type";
import { GalleryUploadedMediaStatus } from "@/lib/api/gallery/types";
import { runRequest } from "@/lib/api/global";
import { buildSearchParams } from "@/lib/utils";
import { Leastwise } from "@/lib/utils/types";
import { useParams, useRouter } from "next/navigation";
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";

class ExploreFilterData {
    event: ExploreEvent | null;
    photographer: ExplorePhotographer | null;
    status: GalleryUploadedMediaStatus | null;

    constructor(prev: ExploreFilterData) {
        this.event = prev.event;
        this.photographer = prev.photographer;
        this.status = prev.status;
    }
}

type ExploreFilter = {
    eventId: number | null;
    photographerId: number | null;
    status: string | null;
}

type FilterSetterBaseData = { eventId: number | null, photographerId: number | null, status: GalleryUploadedMediaStatus | null };
export type FilterSetterData = Partial<FilterSetterBaseData>;
type FilterSetterSearchData = Leastwise<FilterSetterBaseData>;

interface ExploreNavigationProviderType {
    events: Map<number, ExploreEvent>;
    photographers: Map<number, ExplorePhotographer>;
    currentFilter?: ExploreFilter;
    currentFilterData?: ExploreFilterData;
    showFilters: boolean;
    setShowFilters: Dispatch<SetStateAction<boolean>>;
    setFilter(data: FilterSetterData): void;
    loading: boolean;
}

const ExploreNavigationContext = createContext<ExploreNavigationProviderType>(undefined as any);

export function ExploreNavigationProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [currentFilter, setCurrentFilter] = useState<ExploreFilter>();
    const [currentFilterData, setCurrentFilterData] = useState<ExploreFilterData>();
    const [showFilters, setShowFilters] = useState(false);
    const [events, setEvents] = useState<Map<number, ExploreEvent>>(new Map());
    const [photographers, setPhotographers] = useState<Map<number, ExplorePhotographer>>(new Map());

    const [loading, setLoading] = useState(false);
    const [definitiveLoading, setDefinitiveLoading] = useState(false);

    // TODO: understand with usePathname and useParams
    const loadFilterData = useCallback((data: FilterSetterSearchData) => {
        const exists = (value: any) => value !== undefined && value !== null;
        const coalesce = (value: any, fallback: any) => value === null ? null : value ?? fallback;

        const eventSearch = exists(data.eventId)
            ? runRequest({
                action: new ExploreEventApiAction(),
                pathParams: { "id": data.eventId }
            })
            : Promise.resolve(data.eventId);
        const photographerSearch = exists(data.photographerId)
            ? runRequest({
                action: new ExplorePhotographerApiAction(),
                pathParams: { "id": data.photographerId }
            })
            : Promise.resolve(data.photographerId);
        const allEvents = runRequest({
            action: new ExploreEventsApiAction(),
            searchParams: buildSearchParams({ "photographerUserId": String(data.photographerId ?? "") })
        });
        const allPhotographers = runRequest({
            action: new ExplorePhotographersApiAction(),
            searchParams: buildSearchParams({ "eventId": String(data.eventId ?? "") })
        });

        setLoading(true);
        return Promise.all([eventSearch, photographerSearch, Promise.resolve(data.status), allEvents, allPhotographers])
            .then(([eventRes, photographerRes, statusRes, allEventsRes, allPhotographersRes]) => {
                setCurrentFilterData(prev => new ExploreFilterData({
                    event: coalesce(eventRes, prev?.event),
                    photographer: coalesce(photographerRes, prev?.photographer),
                    status: coalesce(statusRes, prev?.status)
                }));
                setEvents(prev => {
                    const next = new Map();
                    for (const evt of allEventsRes.events) {
                        next.set(evt.event.id, evt);
                    }
                    return next;
                });
                setPhotographers(prev => {
                    const next = new Map();
                    for (const pht of allPhotographersRes.photographers) {
                        next.set(pht.user.userId, pht);
                    }
                    return next;
                })
            }).finally(() => {
                setLoading(false);
                setDefinitiveLoading(false);
            });
    }, []);

    // URL Parsing logic
    const router = useRouter();
    const params = useParams();
    const slug = params.data as string[] | undefined;
    const { event, photographer, status } = parseExploreSlug(slug);

    useEffect(() => {
        setDefinitiveLoading(true);
        loadFilterData({ eventId: event, photographerId: photographer, status: status });
        setCurrentFilter({
            eventId: event,
            photographerId: photographer,
            status: status
        });

        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, [event, photographer, status]);

    const onPopState = () => {
        setCurrentFilter(undefined);
    }

    const setFilter = (data: FilterSetterData) => {
        setCurrentFilter(undefined);
        const values = [];

        const nextEventId = data.eventId !== undefined ? data.eventId : event;
        const nextPhotographerId = data.photographerId !== undefined ? data.photographerId : photographer;
        const nextStatus = data.status !== undefined ? data.status : status;

        if (nextEventId === event && nextPhotographerId === photographer && nextStatus === status) {
            return;
        }

        // Only append to the dynamic path if the next value isn't explicitly null
        if (nextEventId !== null) {
            values.push(ExploreUrl.EVENT, String(nextEventId));
        }
        if (nextPhotographerId !== null) {
            values.push(ExploreUrl.PHOTOGRAPHER, String(nextPhotographerId));
        }
        if (nextStatus !== null) {
            values.push(ExploreUrl.STATUS, nextStatus);
        }

        router.push(`/gallery/explore/${values.join("/")}`);
    }

    return <ExploreNavigationContext.Provider value={{
        events,
        photographers,
        currentFilter,
        currentFilterData,
        showFilters,
        setShowFilters,
        setFilter,
        loading: definitiveLoading
    }}>
        {children}
    </ExploreNavigationContext.Provider>
}

export function useExploreNavigation() {
    const context = useContext(ExploreNavigationContext);
    if (!context) {
        throw new Error("useExploreNavigation must be used within a ExploreNavigationProvider");
    }
    return context;
}