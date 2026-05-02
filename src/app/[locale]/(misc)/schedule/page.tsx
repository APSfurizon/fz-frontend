"use client";

import ErrorMessage from "@/components/errorMessage";
import useTitle from "@/components/hooks/useTitle";
import LoadingPanel from "@/components/loadingPanel";
import ScheduleCalendar from "@/components/schedule/scheduleCalendar";
import { loadScheduleActivities } from "@/lib/api/schedule_detail";
import { ApiErrorResponse } from "@/lib/api/global";
import {
    mapScheduleActivitiesToEvents,
    SCHEDULE_ROOMS,
    ScheduleActivityApiItem,
    ScheduleEvent,
} from "@/lib/schedule";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ScheduleLegend from "@/components/schedule/scheduleLegenda";

function formatDayKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseDayKey(value: string | null): Date | undefined {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return undefined;
    }

    const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
    const parsed = new Date(year, month - 1, day);
    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }

    return parsed;
}

export default function SchedulePage() {
    const locale = useLocale();
    const t = useTranslations("common");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [activities, setActivities] = useState<ScheduleActivityApiItem[]>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiErrorResponse>();
    const [selectedDayKey, setSelectedDayKey] = useState<string | undefined>(() => {
        const day = searchParams.get("day");
        return day ?? undefined;
    });
    const fetchStarted = useRef(false);

    useTitle(t("header.schedule"));

    const events = useMemo(
        () => mapScheduleActivitiesToEvents(activities ?? [], locale),
        [activities, locale],
    );

    const initialDate = useMemo(
        () => parseDayKey(searchParams.get("day") ?? selectedDayKey ?? null),
        [searchParams, selectedDayKey],
    );

    useEffect(() => {
        if (fetchStarted.current) return;
        fetchStarted.current = true;

        setLoading(true);
        loadScheduleActivities()
            .then((result) => {
                setActivities(result);
                setError(undefined);
            })
            .catch((reason: ApiErrorResponse | Error) => {
                if (reason instanceof Error) {
                    setError({ errorMessage: reason.message });
                    return;
                }

                setError(reason);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleEventClick = (event: ScheduleEvent) => {
        const activity = event.resource as ScheduleActivityApiItem | undefined;
        if (!activity?.id) {
            return;
        }

        const params = new URLSearchParams();
        params.set("id", String(activity.id));

        const dayKey = selectedDayKey ?? searchParams.get("day") ?? undefined;
        if (dayKey) {
            params.set("day", dayKey);
        }

        router.push(`/schedule/schedule_detail?${params.toString()}`);
    };

    const handleDateChange = (date: Date) => {
        const dayKey = formatDayKey(date);
        setSelectedDayKey(dayKey);

        if (searchParams.get("day") === dayKey) {
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.set("day", dayKey);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="page schedule-page vertical-list gap-4mm" key="schedule-page">
            <div className="schedule-dialog rounded-s" key="schedule-content">
                {loading && <LoadingPanel />}
                {!loading && error && <ErrorMessage error={error} />}
                {!loading && !error && (
                    <ScheduleCalendar
                        events={events}
                        rooms={SCHEDULE_ROOMS}
                        onEventClick={handleEventClick}
                        initialDate={initialDate}
                        onDateChange={handleDateChange}
                    />
                )}
                <ScheduleLegend />
            </div>
        </div>
    );
}
