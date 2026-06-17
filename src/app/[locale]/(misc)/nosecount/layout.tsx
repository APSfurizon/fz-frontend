"use client";
import FpButton from "@/components/input/fpButton";
import FpSelect from "@/components/input/fpSelect";
import { ConventionEvent, CountViewMode, GetAllEventsApiAction, NosecountContext } from "@/lib/api/counts";
import { runRequest } from "@/lib/api/networking/main";
import { SelectItem } from "@/lib/components/fpSelect";
import { inputEntityCodeExtractor } from "@/lib/components/input";
import { TranslatableInputEntity } from "@/lib/translations";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function NosecountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const t = useTranslations();
  const [events, setEvents] = useState<ConventionEvent[]>();
  const [selectedSlug, setSelectedSlug] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ConventionEvent>();
  const router = useRouter();
  const items = useMemo(
    () =>
      (events || [])
        .toSorted((a, b) => new Date(a.correctDateFrom).getTime() - new Date(b.correctDateFrom).getTime())
        .toReversed()
        .map((evt) => new SelectItem(undefined, evt.slug, undefined, undefined, undefined, undefined, evt.eventNames)),
    [events]
  );

  const [viewMode, setViewMode] = useState<CountViewMode>(CountViewMode.NORMAL);

  useEffect(() => {
    if (events) return;
    setLoading(true);
    runRequest({ action: new GetAllEventsApiAction() })
      .then((result) => setEvents(result.events))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [events]);

  /** Fired by child components */
  function selectEvent(slug: string) {
    if (selectedSlug == slug) return;
    setSelectedSlug(slug);
  }

  function selectMode(mode: string) {
    let toSet: CountViewMode = CountViewMode.NORMAL;
    switch (mode) {
      case CountViewMode.FURSUIT.toString():
        toSet = CountViewMode.FURSUIT;
        break;
      case CountViewMode.SPONSOR.toString():
        toSet = CountViewMode.SPONSOR;
        break;
      default:
        toSet = CountViewMode.NORMAL;
        break;
    }
    setViewMode(toSet);
  }

  useEffect(() => {
    if (!events) return;
    if (!selectedSlug) {
      const current =
        events.find((evt) => !!evt.current) ??
        events.toSorted(
          (evt1, evt2) => new Date(evt2.correctDateFrom).getTime() - new Date(evt1.correctDateFrom).getTime()
        )[0];
      if (current) {
        selectEvent(current.slug);
      }
    } else {
      setSelectedEvent((events || []).find((evt) => evt.slug == selectedSlug));
    }
  }, [selectedSlug, events]);

  /**
   * Event that's fired from the FpSelect
   * @param selected
   */
  function onSelectEvent(selected?: TranslatableInputEntity) {
    router.push(["/nosecount", selected?.code].join("/"));
  }

  function onSelectMode(mode: CountViewMode) {
    if (viewMode == mode || !selectedEvent) return;
    router.push(["/nosecount", selectedEvent?.slug, mode].join("/"));
  }

  return (
    <div className="main-dialog rounded-s">
      <div className="page">
        <div className="horizontal-list gap-4mm flex-wrap">
          <FpButton
            className={(viewMode != CountViewMode.NORMAL ? "off" : "") + " margin-bottom-1mm"}
            icon="GROUPS"
            onClick={() => onSelectMode(CountViewMode.NORMAL)}
          >
            {t("misc.nosecount.title")}
          </FpButton>
          <FpButton
            className={(viewMode != CountViewMode.FURSUIT ? "off" : "") + " margin-bottom-1mm"}
            icon="PETS"
            onClick={() => onSelectMode(CountViewMode.FURSUIT)}
          >
            {t("misc.nosecount.links.fursuits")}
          </FpButton>
          <FpButton
            className={(viewMode != CountViewMode.SPONSOR ? "off" : "") + " margin-bottom-1mm"}
            icon="WORKSPACE_PREMIUM"
            onClick={() => onSelectMode(CountViewMode.SPONSOR)}
          >
            {t("misc.nosecount.links.sponsors")}
          </FpButton>
          <div className="spacer"></div>
          <FpSelect
            itemExtractor={inputEntityCodeExtractor}
            required
            items={items}
            placeholder={t("misc.nosecount.input.select_event")}
            disabled={(events || []).length == 0}
            initialValue={selectedEvent?.slug}
            onChange={onSelectEvent}
          />
          <FpButton
            icon="REFRESH"
            className="margin-bottom-1mm"
            title={t("common.reload")}
            onClick={() => setEvents(undefined)}
            busy={loading}
            debounce={3000}
          />
        </div>
        <NosecountContext.Provider
          value={{
            event: selectedEvent,
            mode: viewMode,
            selectEvent,
            selectMode,
          }}
        >
          {children}
        </NosecountContext.Provider>
      </div>
    </div>
  );
}
