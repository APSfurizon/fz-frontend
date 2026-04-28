"use client";
import { Calendar, dateFnsLocalizer, Formats, Messages, ToolbarProps } from "react-big-calendar";
import { addHours, format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import { enGB, it } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import Icon, { ICONS } from "@/components/icon";
import type { ScheduleActivityApiItem, ScheduleEvent, ScheduleRoom } from "@/lib/schedule";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/misc/schedule.css";

interface ScheduleCalendarProps {
    events: ScheduleEvent[];
    rooms: ScheduleRoom[];
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
    const activity = event.resource as ScheduleActivityApiItem | undefined;

    return (
        <div className="schedule-event-card">
            <div className="schedule-event-title">{event.title}</div>
            {activity?.host ? (
                <div className="schedule-event-host">
                    <Icon icon={ICONS.PERSON} className="schedule-event-host-icon" />
                    <span>{activity.host}</span>
                </div>
            ) : null}
        </div>
    );
}

export default function ScheduleCalendar({ events, rooms }: ScheduleCalendarProps) {
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

    const [currentDate, setCurrentDate] = useState<Date>(CONV_START);

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
    };

    return (
        <div className="schedule-wrapper">
            <Calendar
                localizer={localizer}
                events={displayEvents}
                resources={rooms}
                startAccessor="start"
                endAccessor="end"
                resourceAccessor="resourceId"
                resourceIdAccessor="resourceId"
                resourceTitleAccessor="resourceTitle"
                culture={locale}
                date={currentDate}
                view="day"
                onNavigate={handleNavigate}
                views={["day"]}
                min={DAY_MIN_TIME}
                max={DAY_MAX_TIME}
                messages={messages}
                formats={formats}
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
