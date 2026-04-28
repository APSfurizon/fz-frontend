export interface ScheduleEvent {
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resourceId: string;
    resource?: unknown;
}

export interface ScheduleRoom {
    resourceId: string;
    resourceTitle: string;
}

export interface ScheduleActivityApiItem {
    title: string;
    titleIT?: string;
    subtitle: string;
    subtitleIT: string;
    about: string;
    aboutIT: string;
    start: string;
    end: string;
    durata: string | null;
    language: string | null;
    sponsor: boolean;
    super_sponsor: boolean;
    ultra_sponsor: boolean;
    location: string;
    host: string | null;
    titleEmote?: string | null;
    visibile: boolean;
    modificato: boolean;
    cancellato: boolean;
    feedback: boolean;
    id: number;
    immagineCentrata: boolean;
    languageIcon: string | null;
}

export const SCHEDULE_ROOMS: ScheduleRoom[] = [
    { resourceId: "main-stage", resourceTitle: "Main Stage" },
    { resourceId: "panel-room-1", resourceTitle: "Panel Room 1" },
    { resourceId: "panel-room-2", resourceTitle: "Panel Room 2" },
    { resourceId: "dealers-den", resourceTitle: "Dealers' Den" },
    { resourceId: "cnc", resourceTitle: "C&C" },
    { resourceId: "forecourt", resourceTitle: "Forecourt" },
];

const ROOM_ID_BY_LOCATION: Record<string, string> = {
    "Main Stage": "main-stage",
    "Panel Room 1": "panel-room-1",
    "Panel Room 2": "panel-room-2",
    "Dealers' Den": "dealers-den",
    "Dealers Den": "dealers-den",
    "Dealers": "dealers-den",
    "C&C": "cnc",
    "Forecourt": "forecourt",
};

export function mapScheduleLocationToRoomId(location: string): string | null {
    return ROOM_ID_BY_LOCATION[location] ?? null;
}

export function mapScheduleActivityToEvent(
    activity: ScheduleActivityApiItem,
    locale: string,
): ScheduleEvent | null {
    if (activity.visibile === false || activity.cancellato === true) {
        return null;
    }

    const resourceId = mapScheduleLocationToRoomId(activity.location);
    if (!resourceId) {
        return null;
    }

    const start = new Date(activity.start);
    const end = new Date(activity.end);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null;
    }

    const localizedTitle = locale === "it-IT"
        ? activity.titleIT?.trim() || activity.title.trim()
        : activity.title.trim() || activity.titleIT?.trim() || "";
    const prefix = activity.titleEmote?.trim();

    return {
        title: prefix ? `${prefix} ${localizedTitle}` : localizedTitle,
        start,
        end,
        resourceId,
        resource: activity,
    };
}

export function mapScheduleActivitiesToEvents(
    activities: ScheduleActivityApiItem[],
    locale: string,
): ScheduleEvent[] {
    return activities.flatMap((activity) => {
        const event = mapScheduleActivityToEvent(activity, locale);
        return event ? [event] : [];
    });
}