import { ExploreEvent, ExplorePhotographer } from "@/lib/api/gallery/explore/type";
import { GalleryUploadedMediaStatus } from "@/lib/api/gallery/types";
import { Leastwise } from "@/lib/utils/types";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { FilterSetterSearchData, useExploreNavigation } from "./exploreNavigationProvider";
import { runRequest } from "@/lib/api/global";
import { ExploreEventApiAction, ExploreEventsApiAction, ExplorePhotographerApiAction, ExplorePhotographersApiAction } from "@/lib/api/gallery/explore/api";
import { buildSearchParams } from "@/lib/utils";

interface ExploreFilterDataProviderType {
    currentFilterData?: ExploreFilterData;
    loading: boolean;
    events: Map<number, ExploreEvent>;
    photographers: Map<number, ExplorePhotographer>;
}

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

const ExploreFilterDataContext = createContext<ExploreFilterDataProviderType>(undefined as any);

export function ExploreFilterDataProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [loading, setLoading] = useState(false);
    const [currentFilterData, setCurrentFilterData] = useState<ExploreFilterData>();
    const [events, setEvents] = useState<Map<number, ExploreEvent>>(new Map());
    const [photographers, setPhotographers] = useState<Map<number, ExplorePhotographer>>(new Map());

    const { currentFilter } = useExploreNavigation();

    useEffect(() => {
        loadFilterData({
            eventId: currentFilter?.eventId,
            photographerId: currentFilter?.photographerId,
            status: currentFilter?.status as GalleryUploadedMediaStatus
        });
    }, [currentFilter]);

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
            });
    }, []);

    return <ExploreFilterDataContext.Provider value={{
        events,
        photographers,
        currentFilterData,
        loading
    }}>
        {children}
    </ExploreFilterDataContext.Provider>
}

export function useExploreFilterData() {
    const context = useContext(ExploreFilterDataContext);
    if (!context) {
        throw new Error("useExploreFilterData must be used within a ExploreFilterDataProvider");
    }
    return context;
}