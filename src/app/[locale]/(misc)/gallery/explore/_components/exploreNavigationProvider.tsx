import { ExploreUrl, parseExploreSlug } from "@/lib/api/gallery/explore/main";
import { GalleryUploadedMediaStatus } from "@/lib/api/gallery/types";
import { Leastwise } from "@/lib/utils/types";
import { useParams, useRouter } from "next/navigation";
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";

type ExploreFilter = {
  eventId: number | null;
  photographerId: number | null;
  status: string | null;
};

export type FilterSetterBaseData = {
  eventId: number | null;
  photographerId: number | null;
  status: GalleryUploadedMediaStatus | null;
};
export type FilterSetterData = Partial<FilterSetterBaseData>;
export type FilterSetterSearchData = Leastwise<FilterSetterBaseData>;

interface ExploreNavigationProviderType {
  currentFilter?: ExploreFilter;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  setFilter(data: FilterSetterData): void;
}

const ExploreNavigationContext = createContext<ExploreNavigationProviderType>({} as ExploreNavigationProviderType);

export function ExploreNavigationProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [currentFilter, setCurrentFilter] = useState<ExploreFilter>();
  const [showFilters, setShowFilters] = useState(false);

  // URL Parsing logic
  const router = useRouter();
  const params = useParams();
  const slug = params.data as string[] | undefined;
  const { event, photographer, status } = parseExploreSlug(slug);

  const onPopState = () => {
    setCurrentFilter(undefined);
  };

  useEffect(() => {
    setCurrentFilter({
      eventId: event,
      photographerId: photographer,
      status: status,
    });

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [event, photographer, status]);

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
  };

  return (
    <ExploreNavigationContext.Provider
      value={{
        currentFilter,
        showFilters,
        setShowFilters,
        setFilter,
      }}
    >
      {children}
    </ExploreNavigationContext.Provider>
  );
}

export function useExploreNavigation() {
  const context = useContext(ExploreNavigationContext);
  if (!context) {
    throw new Error("useExploreNavigation must be used within a ExploreNavigationProvider");
  }
  return context;
}
