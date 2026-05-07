import { ExploreEventApiAction, ExploreEventsApiAction, ExplorePhotographerApiAction, ExplorePhotographersApiAction } from "@/lib/api/gallery/explore/api";
import { ExploreEvent, ExplorePhotographer } from "@/lib/api/gallery/explore/type";
import { runRequest } from "@/lib/api/global";
import { buildSearchParams } from "@/lib/utils";
import { createContext, useCallback, useContext, useState } from "react";

type ExploreFilter = {
    event?: ExploreEvent,
    photographer?: ExplorePhotographer
}

interface ExploreProviderType {
    events: Map<number, ExploreEvent>;
    photographers: Map<number, ExplorePhotographer>;
    setFixedEvent(eventId: number): void;
    setFixedPhotographer(photographerId: number): void;
    searchEvent(eventId: number): void;
    searchPhotographer(photographerId: number): void;
    searchData(eventId: number, photographerId: number): Promise<any>;
    currentFilter?: ExploreFilter,
    reloadData(): void;
    loading: boolean;
}

const ExploreContext = createContext<ExploreProviderType>(undefined as any);

export function ExploreProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [events, setEvents] = useState<Map<number, ExploreEvent>>(new Map());
    const [photographers, setPhotographers] = useState<Map<number, ExplorePhotographer>>(new Map());

    const [currentFilter, setCurrentFilter] = useState<ExploreFilter>();

    const [loading, setLoading] = useState(false);

    const setFixedEvent = useCallback((eventId: number) => {
        setCurrentFilter(prev => ({ ...prev, event: events.get(eventId) ?? prev?.event }));
    }, [events]);

    const setFixedPhotographer = useCallback((photographerId: number) => {
        setCurrentFilter(prev => ({ ...prev, photographer: photographers.get(photographerId) ?? prev?.photographer }));
    }, [photographers]);

    const searchData = useCallback((eventId?: number, photographerId?: number) => {
        if (!eventId && !photographerId) return Promise.reject("No data provided");
        const eventSearch = eventId
            ? runRequest({
                action: new ExploreEventApiAction(),
                pathParams: { "id": eventId }
            })
            : Promise.resolve(undefined);
        const photographerSearch = photographerId
            ? runRequest({
                action: new ExplorePhotographerApiAction(),
                pathParams: { "id": photographerId }
            })
            : Promise.resolve(undefined);
        setLoading(true);
        return Promise.all([eventSearch, photographerSearch])
            .then(([event, photographer]) => {
                setCurrentFilter(prev => ({
                    event: event ?? prev?.event,
                    photographer: photographer ?? prev?.photographer
                }))
            }).finally(() => setLoading(false));
    }, [])

    const searchEvent = useCallback((eventId: number) => {
        return searchData(eventId);
    }, []);

    const searchPhotographer = useCallback((photographerId: number) => {
        return searchData(undefined, photographerId);
    }, []);



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

    return <ExploreContext.Provider value={{
        events,
        photographers,
        setFixedEvent,
        setFixedPhotographer,
        searchEvent,
        searchPhotographer,
        searchData,
        currentFilter,
        reloadData,
        loading
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