"use client";

import { Calendar, dateFnsLocalizer, Formats, Messages, ToolbarProps } from "react-big-calendar";
import { addHours, format, parse, startOfWeek, getDay, isSameDay, type Locale } from "date-fns";
import { enGB, it } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ScheduleEvent, ScheduleRoom } from "@/lib/schedule";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/misc/schedule.css";
import Icon, { MaterialIcon } from "../icon";

interface ScheduleCalendarProps {
    events: ScheduleEvent[];
    rooms: ScheduleRoom[];
    onEventClick?: (event: ScheduleEvent) => void;
    initialDate?: Date;
    onDateChange?: (date: Date) => void;
}

const CONV_START = new Date(2026, 5, 2);
const DISPLAY_SHIFT_HOURS = 10;
const DAY_MIN_TIME = new Date(2026, 5, 2, 0, 0);
const DAY_MAX_TIME = new Date(2026, 5, 2, 16, 30);
const CONV_DAYS = [
    new Date(2026, 5, 2),
    new Date(2026, 5, 3),
    new Date(2026, 5, 4),
    new Date(2026, 5, 5),
];

const locales = {
    "en-GB": enGB,
    "it-IT": it,
};

interface DayToolbarProps extends ToolbarProps<ScheduleEvent, ScheduleRoom> {
    dateFnsLocale: Locale;
}

function useNarrowScreenMode() {
    const [isNarrowScreen, setIsNarrowScreen] = useState(false);

    useEffect(() => {
        const check = () => setIsNarrowScreen(window.innerWidth < 800);
        check();

        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return isNarrowScreen;
}

function shiftHours(date: Date, amount: number): Date {
    return addHours(date, amount);
}

function DayToolbar({ date, onNavigate, dateFnsLocale }: DayToolbarProps) {
    return (
        <div className="schedule-day-toolbar">
            {CONV_DAYS.map((day) => {
                const isActive = isSameDay(date, day);
                const label = format(day, "EEE d MMM", { locale: dateFnsLocale });

                return (
                    <button
                        key={day.toISOString()}
                        className={`schedule-day-tab${isActive ? " active" : ""}`}
                        onClick={() => onNavigate("DATE", day)}
                        aria-current={isActive ? "date" : undefined}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

function MobileDayTabs({
    date,
    onDateChange,
    dateFnsLocale,
}: {
    date: Date;
    onDateChange: (date: Date) => void;
    dateFnsLocale: Locale;
}) {
    return (
        <div className="schedule-day-toolbar">
            {CONV_DAYS.map((day) => {
                const isActive = isSameDay(date, day);
                const label = format(day, "EEE d MMM", { locale: dateFnsLocale });

                return (
                    <button
                        key={day.toISOString()}
                        className={`schedule-day-tab${isActive ? " active" : ""}`}
                        onClick={() => onDateChange(day)}
                        aria-current={isActive ? "date" : undefined}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

function ScheduleEventCard({ event }: { event: ScheduleEvent }) {
    const durationMinutes = Math.max(0, (event.end.getTime() - event.start.getTime()) / 60000);
    const compact = durationMinutes < 45;
    const cardRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        const title = titleRef.current;
        if (!card || !title) return;

        const fitTitle = () => {
            title.style.fontSize = "";

            let currentSize = parseFloat(getComputedStyle(title).fontSize);
            const minSize = compact ? 10.5 : 11.5;
            let guard = 0;

            while (guard < 18) {
                const overflowY = title.scrollHeight > card.clientHeight - 4;
                const overflowX = title.scrollWidth > title.clientWidth + 1;

                if ((!overflowY && !overflowX) || currentSize <= minSize) break;

                currentSize -= 0.5;
                title.style.fontSize = `${currentSize}px`;
                guard += 1;
            }
        };

        fitTitle();

        const observer = new ResizeObserver(fitTitle);
        observer.observe(card);
        observer.observe(title);

        return () => observer.disconnect();
    }, [compact, event.title]);

    return (
        <div ref={cardRef} className={`schedule-event-card${compact ? " compact" : ""}`}>
            <div ref={titleRef} className="schedule-event-heading">

                <div className="schedule-event-title">
                    <span className="schedule-event-emote" aria-hidden="true">
                        {event.titleEmote}
                    </span>
                    {event.title}
                </div>
            </div>
        </div>
    );
}

export default function ScheduleCalendar({
    events,
    rooms,
    onEventClick,
    initialDate,
    onDateChange,
}: ScheduleCalendarProps) {
    const locale = useLocale();
    const t = useTranslations("common");
    const dateFnsLocale = locale === "it-IT" ? it : enGB;
    const isNarrowScreen = useNarrowScreenMode();

    const localizer = useMemo(
        () =>
            dateFnsLocalizer({
                format,
                parse,
                startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
                getDay,
                locales,
            }),
        [],
    );

    const [currentDate, setCurrentDate] = useState<Date>(() => {
        if (initialDate) return initialDate;
        const today = new Date();
        return CONV_DAYS.find((d) => isSameDay(d, today)) ?? CONV_START;
    });

    const displayEvents = useMemo(
        () =>
            events.map((event) => ({
                ...event,
                start: shiftHours(event.start, -DISPLAY_SHIFT_HOURS),
                end: shiftHours(event.end, -DISPLAY_SHIFT_HOURS),
            })),
        [events],
    );

    const currentDayEvents = useMemo(() => {
        return events
            .filter((event) => isSameDay(event.start, currentDate))
            .sort((a, b) => a.start.getTime() - b.start.getTime());
    }, [events, currentDate]);

    const formats: Formats = {
        timeGutterFormat: (date) =>
            format(shiftHours(date, DISPLAY_SHIFT_HOURS), "HH:mm", { locale: dateFnsLocale }),
        eventTimeRangeFormat: ({ start, end }) => {
            const startLabel = format(shiftHours(start, DISPLAY_SHIFT_HOURS), "HH:mm", {
                locale: dateFnsLocale,
            });
            const endLabel = format(shiftHours(end, DISPLAY_SHIFT_HOURS), "HH:mm", {
                locale: dateFnsLocale,
            });
            return `${startLabel} - ${endLabel}`;
        },
    };

    const messages: Messages = {
        allDay: t("schedule.labels.all_day"),
        noEventsInRange: t("schedule.labels.no_events"),
        date: t("schedule.labels.date"),
        time: t("schedule.labels.time"),
        event: t("schedule.labels.event"),
        showMore: (total) => `+${total} ${t("schedule.labels.others")}`,
    };

    const handleNavigate = (date: Date) => {
        setCurrentDate(date);
        onDateChange?.(date);
    };

    if (isNarrowScreen) {
        return (
            <div className="schedule-wrapper mobile">
                <MobileDayTabs
                    date={currentDate}
                    onDateChange={handleNavigate}
                    dateFnsLocale={dateFnsLocale}
                />

                <div className="schedule-mobile-timeline">
                    {currentDayEvents.length === 0 && (
                        <div className="schedule-mobile-empty">{t("schedule.labels.no_events")}</div>
                    )}

                    {currentDayEvents.map((event) => {
                        const now = new Date();

                        const isNow = now >= event.start && now <= event.end;
                        const isPast = now > event.end;

                        const startLabel = format(event.start, "HH:mm", { locale: dateFnsLocale });
                        const endLabel = format(event.end, "HH:mm", { locale: dateFnsLocale });

                        const durationMinutes = Math.max(
                            0,
                            (event.end.getTime() - event.start.getTime()) / 60000,
                        );

                        const room = rooms.find((r) => r.resourceId === event.resourceId);

                        return (
                            <div
                                key={`${event.title}-${event.start.toISOString()}-${event.resourceId ?? ""}`}
                                className={`schedule-mobile-row ${isNow ? "now" : ""} ${isPast ? "past" : ""}`}
                            >
                                <div className="schedule-mobile-hour">
                                    <span>{startLabel}</span>
                                    <div className="schedule-mobile-line" />
                                </div>

                                <div
                                    className={`schedule-mobile-dot ${isNow ? "now" : ""} ${isPast ? "past" : ""
                                        }`}
                                />

                                <button
                                    className={`schedule-mobile-card 
                                        ${event.cancellato ? "canceled" : ""}
                                        ${event.tipologia ? `tipologia-${event.tipologia.toLowerCase()}` : ""}
                                        ${isNow ? "now" : ""}
                                        ${isPast ? "past" : ""}
                                    `}
                                    onClick={() => onEventClick?.(event)}
                                >
                                    <div className="schedule-mobile-card-title">
                                        {event.titleEmote && (
                                            <span aria-hidden="true">{event.titleEmote} </span>
                                        )}
                                        {event.title}
                                    </div>
                                    {room?.resourceTitle && (
                                        <div className="schedule-mobile-card-room horizontal-list flex-vertical-center gap-2mm">
                                            <Icon className="medium" icon="LOCATION_ON" />
                                            <span>{room.resourceTitle}</span>
                                        </div>
                                    )}
                                    <div className="schedule-detail-info-field horizontal-list flex-vertical-center gap-2mm">
                                        <div className="schedule-detail-info-icon">
                                            <Icon className="medium" icon={"TIMELAPSE"} />
                                        </div>
                                        <div className="schedule-detail-info-content vertical-list">
                                            <span className="schedule-detail-info-value"><strong>{startLabel} - {endLabel}</strong></span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="schedule-wrapper">
            <Calendar
                localizer={localizer}
                events={displayEvents}
                resources={rooms}
                startAccessor="start"
                endAccessor="end"
                tooltipAccessor={(event) =>
                    event.cancellato ? `${event.title} - CANCELLATO` : event.title
                }
                resourceAccessor="resourceId"
                resourceIdAccessor="resourceId"
                resourceTitleAccessor="resourceTitle"
                culture={locale}
                date={currentDate}
                view="day"
                onNavigate={handleNavigate}
                views={["day"]}
                dayLayoutAlgorithm="no-overlap"
                step={15}
                timeslots={4}
                min={DAY_MIN_TIME}
                max={DAY_MAX_TIME}
                messages={messages}
                formats={formats}
                onSelectEvent={(event) => onEventClick?.(event)}
                eventPropGetter={(event) => {
                    const classes: string[] = [];
                    const durationMinutes = Math.max(
                        0,
                        (event.end.getTime() - event.start.getTime()) / 60000,
                    );

                    if (event.tipologia) {
                        classes.push(`tipologia-${event.tipologia.toLowerCase()}`);
                    }

                    if (durationMinutes < 20) {
                        classes.push("duration-under-20");
                    }

                    if (event.cancellato) {
                        classes.push("canceled");
                    }

                    return {
                        className: classes.length > 0 ? classes.join(" ") : undefined,
                    };
                }}
                components={{
                    toolbar: (props) => <DayToolbar {...props} dateFnsLocale={dateFnsLocale} />,
                    event: ScheduleEventCard,
                }}
                style={{ height: "100%", minHeight: 600 }}
            />
        </div>
    );
}

export type { ScheduleEvent, ScheduleRoom };