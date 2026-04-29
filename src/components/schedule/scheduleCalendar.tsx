"use client";
import { Calendar, dateFnsLocalizer, Formats, Messages, ToolbarProps } from "react-big-calendar";
import { addHours, format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import { enGB, it } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ScheduleEvent, ScheduleRoom } from "@/lib/schedule";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/misc/schedule.css";

interface ScheduleCalendarProps {
    events: ScheduleEvent[];
    rooms: ScheduleRoom[];
    onEventClick?: (event: ScheduleEvent) => void;
    initialDate?: Date;
    onDateChange?: (date: Date) => void;
}

const CONV_START = new Date(2026, 5, 2); // June 2, 2026
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

interface DayToolbarProps extends ToolbarProps {
    dateFnsLocale: Locale;
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

function ScheduleEventCard({ event }: { event: ScheduleEvent }) {
    const durationMinutes = Math.max(0, (event.end.getTime() - event.start.getTime()) / 60000);
    const compact = durationMinutes < 45;
    const cardRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        const title = titleRef.current;
        if (!card || !title) {
            return;
        }

        const fitTitle = () => {
            title.style.fontSize = "";

            let currentSize = parseFloat(getComputedStyle(title).fontSize);
            const minSize = compact ? 10.5 : 11.5;
            let guard = 0;

            while (guard < 18) {
                const overflowY = title.scrollHeight > card.clientHeight - 4;
                const overflowX = title.scrollWidth > title.clientWidth + 1;

                if ((!overflowY && !overflowX) || currentSize <= minSize) {
                    break;
                }

                currentSize -= 0.5;
                title.style.fontSize = `${currentSize}px`;
                guard += 1;
            }
        };

        fitTitle();

        const observer = new ResizeObserver(fitTitle);
        observer.observe(card);
        observer.observe(title);

        return () => {
            observer.disconnect();
        };
    }, [compact, event.title]);

    return (
        <div ref={cardRef} className={`schedule-event-card${compact ? " compact" : ""}`}>
            <div ref={titleRef} className="schedule-event-heading">
                {event.titleEmote && (
                    <span className="schedule-event-emote" aria-hidden="true">{event.titleEmote}</span>
                )}
                <div className="schedule-event-title">{event.title}</div>
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
    const t = useTranslations("misc.schedule");
    const dateFnsLocale = locale === "it-IT" ? it : enGB;

    const localizer = dateFnsLocalizer({
        format,
        parse,
        startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
        getDay,
        locales,
    });

    const [currentDate, setCurrentDate] = useState<Date>(() => {
        if (initialDate) return initialDate;
        const today = new Date();
        return CONV_DAYS.find((d) => isSameDay(d, today)) ?? CONV_START;
    });

    // Calendar day view does not support max time past midnight;
    // shift everything by -10h so the visible 00:00-16:30 maps to real 10:00-02:30.
    const displayEvents = useMemo(
        () =>
            events.map((event) => ({
                ...event,
                start: shiftHours(event.start, -DISPLAY_SHIFT_HOURS),
                end: shiftHours(event.end, -DISPLAY_SHIFT_HOURS),
            })),
        [events],
    );

    const formats: Formats = {
        timeGutterFormat: (date) => format(shiftHours(date, DISPLAY_SHIFT_HOURS), "HH:mm", { locale: dateFnsLocale }),
        eventTimeRangeFormat: ({ start, end }) => {
            const startLabel = format(shiftHours(start, DISPLAY_SHIFT_HOURS), "HH:mm", { locale: dateFnsLocale });
            const endLabel = format(shiftHours(end, DISPLAY_SHIFT_HOURS), "HH:mm", { locale: dateFnsLocale });
            return `${startLabel} - ${endLabel}`;
        },
    };

    const messages: Messages = {
        allDay: t("all_day"),
        noEventsInRange: t("no_events"),
        date: "Data",
        time: "Ora",
        event: "Evento",
        showMore: (total) => `+${total} altri`,
    };

    const handleNavigate = (date: Date) => {
        setCurrentDate(date);
        onDateChange?.(date);
    };

    return (
        <div className="schedule-wrapper">
            <Calendar
                localizer={localizer}
                events={displayEvents}
                resources={rooms}
                startAccessor="start"
                endAccessor="end"
                tooltipAccessor={(event) => (
                    event.cancellato ? `${event.title} - CANCELLATO` : event.title
                )}
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
                    toolbar: (props) => (
                        <DayToolbar {...props} dateFnsLocale={dateFnsLocale} />
                    ),
                    event: ScheduleEventCard,
                }}
                style={{ height: "100%", minHeight: 600 }}
            />
        </div>
    );
}

export type { ScheduleEvent, ScheduleRoom };
