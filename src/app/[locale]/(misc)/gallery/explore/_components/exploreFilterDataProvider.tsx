import { ExploreEvent, ExplorePhotographer } from "@/lib/api/gallery/explore/type";
import { GalleryUploadedMediaStatus } from "@/lib/api/gallery/types";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { FilterSetterSearchData, useExploreNavigation } from "./exploreNavigationProvider";
import { runRequest } from "@/lib/api/global";
import {
  ExploreEventApiAction,
  ExploreEventsApiAction,
  ExplorePhotographerApiAction,
  ExplorePhotographersApiAction,
} from "@/lib/api/gallery/explore/api";
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

const ExploreFilterDataContext = createContext<ExploreFilterDataProviderType>({} as ExploreFilterDataProviderType);

export function ExploreFilterDataProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [loading, setLoading] = useState(false);
  const [currentFilterData, setCurrentFilterData] = useState<ExploreFilterData>();
  const [events, setEvents] = useState<Map<number, ExploreEvent>>(new Map());
  const [photographers, setPhotographers] = useState<Map<number, ExplorePhotographer>>(new Map());

  const { currentFilter } = useExploreNavigation();

  // TODO: understand with usePathname and useParams
  const loadFilterData = useCallback((data: FilterSetterSearchData) => {
    const exists = (value: any) => value !== undefined && value !== null;
    const coalesce: <T>(value: T | null | undefined, fallback: T) => T | null = (value, fallback) =>
      value === null ? null : (value ?? fallback);

    const eventSearch = exists(data.eventId)
      ? runRequest({
          action: new ExploreEventApiAction(),
          pathParams: { id: data.eventId },
        })
      : Promise.resolve(null);
    const photographerSearch = exists(data.photographerId)
      ? runRequest({
          action: new ExplorePhotographerApiAction(),
          pathParams: { id: data.photographerId },
        })
      : Promise.resolve(null);
    const allEvents = runRequest({
      action: new ExploreEventsApiAction(),
      searchParams: buildSearchParams({ photographerUserId: String(data.photographerId ?? "") }),
    });
    const allPhotographers = runRequest({
      action: new ExplorePhotographersApiAction(),
      searchParams: buildSearchParams({ eventId: String(data.eventId ?? "") }),
    });

    setLoading(true);
    return Promise.all([eventSearch, photographerSearch, Promise.resolve(data.status), allEvents, allPhotographers])
      .then(([eventRes, photographerRes, statusRes, allEventsRes, allPhotographersRes]) => {
        setCurrentFilterData(
          (prev) =>
            new ExploreFilterData({
              event: coalesce(eventRes, prev?.event ?? null),
              photographer: coalesce(photographerRes, prev?.photographer ?? null),
              status: coalesce(statusRes, prev?.status ?? null),
            })
        );
        setEvents(() => {
          const next = new Map();
          for (const evt of allEventsRes.events) {
            next.set(evt.event.id, evt);
          }
          return next;
        });
        setPhotographers(() => {
          const next = new Map();
          for (const pht of allPhotographersRes.photographers) {
            next.set(pht.user.userId, pht);
          }
          return next;
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFilterData({
      eventId: currentFilter?.eventId,
      photographerId: currentFilter?.photographerId,
      status: currentFilter?.status as GalleryUploadedMediaStatus,
    }).catch(() => {
      throw new Error("Unexpected error");
    });
  }, [currentFilter]);

  return (
    <ExploreFilterDataContext.Provider
      value={{
        events,
        photographers,
        currentFilterData,
        loading,
      }}
    >
      {children}
    </ExploreFilterDataContext.Provider>
  );
}

export function useExploreFilterData() {
  const context = useContext(ExploreFilterDataContext);
  if (!context) {
    throw new Error("useExploreFilterData must be used within a ExploreFilterDataProvider");
  }
  return context;
}
