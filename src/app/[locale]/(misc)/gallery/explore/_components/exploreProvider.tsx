import { useUser } from "@/components/context/userProvider";
import { ExploreApiAction } from "@/lib/api/gallery/explore/api";
import { CachedFullMedias } from "@/lib/api/gallery/explore/main";
import { GalleryUploadedMedia } from "@/lib/api/gallery/types";
import { runRequest } from "@/lib/api/networking/main";
import { Permissions } from "@/lib/api/permission";
import { buildSearchParams } from "@/lib/utils";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useExploreNavigation } from "./exploreNavigationProvider";

interface ExploreProviderType {
  cache: CachedFullMedias;
  nextData: (currentCursor: number) => Promise<GalleryUploadedMedia[]>;
}

const ExploreContext = createContext<ExploreProviderType>({} as ExploreProviderType);

export function ExploreProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { userDisplayRef } = useUser();
  const isAdmin = useMemo(
    // eslint-disable-next-line react-hooks/refs
    () => userDisplayRef.current?.permissions?.includes(Permissions.UPLOADS_CAN_MANAGE_UPLOADS),
    [userDisplayRef.current]
  );
  const [cache] = useState(new CachedFullMedias());
  const { currentFilter } = useExploreNavigation();

  // Fetching logic

  const nextData = useCallback(
    (currentCursor: number) => {
      console.debug("Fetching", currentFilter);
      return runRequest({
        action: new ExploreApiAction(),
        searchParams: buildSearchParams({
          photographerUserId: String(currentFilter?.photographerId ?? ""),
          eventId: String(currentFilter?.eventId ?? ""),
          uploadStatus: isAdmin ? (currentFilter?.status ?? "") : "",
          fromUploadId: String(currentCursor),
        }),
      }).then((r) => r.results);
    },
    [currentFilter]
  );

  return (
    <ExploreContext.Provider
      value={{
        cache,
        nextData,
      }}
    >
      {children}
    </ExploreContext.Provider>
  );
}

export function useExplore() {
  const context = useContext(ExploreContext);
  if (!context) {
    throw new Error("useExplore must be used within a ExploreProvider");
  }
  return context;
}
