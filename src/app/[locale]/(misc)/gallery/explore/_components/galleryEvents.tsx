import { useMemo } from "react";
import EventCard from "./eventCard";
import { useExploreFilterData } from "./exploreFilterDataProvider";
import { useExploreNavigation } from "./exploreNavigationProvider";
import "@/styles/misc/gallery/explore/galleryEvents.scss";

export default function GalleryEvents() {
  const { events } = useExploreFilterData();
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { currentFilter, setFilter } = useExploreNavigation();

  const sortedEvents = useMemo(
    () =>
      Array.from(events.entries()).sort(([, a], [, b]) => {
        return new Date(b.event.correctDateFrom).getTime() - new Date(a.event.correctDateFrom).getTime();
      }),
    [events]
  );

  return (
    !currentFilter?.eventId && (
      <div className="gallery-events__container gap-4mm flex-wrap">
        {sortedEvents.map(([id, value]) => (
          <EventCard key={id} event={value} onClick={(e) => setFilter({ eventId: e.event.id })} />
        ))}
      </div>
    )
  );
}
