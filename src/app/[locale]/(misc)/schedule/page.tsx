"use client";

import ErrorMessage from "@/components/errorMessage";
import useTitle from "@/components/hooks/useTitle";
import LoadingPanel from "@/components/loadingPanel";
import ScheduleCalendar from "@/components/schedule/scheduleCalendar";
import { ApiErrorResponse } from "@/lib/api/global";
import {
    mapScheduleActivitiesToEvents,
    SCHEDULE_ROOMS,
    ScheduleActivityApiItem,
    ScheduleEvent,
} from "@/lib/schedule";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function SchedulePage() {
    const locale = useLocale();
    const t = useTranslations("common");
    const router = useRouter();
    const [activities, setActivities] = useState<ScheduleActivityApiItem[]>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiErrorResponse>();

    useTitle(t("header.schedule"));

    const events = useMemo(
        () => mapScheduleActivitiesToEvents(activities ?? [], locale),
        [activities, locale],
    );

    useEffect(() => {
        if (activities) {
            return;
        }

        setLoading(true);
        fetch("/api/schedule", {
            cache: "no-store",
        })
            .then(async (response) => {
                if (!response.ok) {
                    let errorMessage = "Failed to load schedule.";
                    try {
                        const errorResult = await response.json();
                        errorMessage = errorResult?.errorMessage ?? errorMessage;
                    } catch {
                        errorMessage = (await response.text()) || errorMessage;
                    }

                    throw { errorMessage } as ApiErrorResponse;
                }

                return response.json();
            })
            .then((result) => {
                setActivities(Array.isArray(result) ? (result as ScheduleActivityApiItem[]) : []);
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
    }, [activities]);

    const handleEventClick = (event: ScheduleEvent) => {
        const activity = event.resource as ScheduleActivityApiItem | undefined;
        if (!activity?.id) {
            return;
        }

        router.push(`/schedule_detail?id=${activity.id}`);
    };

    return (
        <div className="page vertical-list gap-4mm">
            {loading && <LoadingPanel />}
            {!loading && error && <ErrorMessage error={error} />}
            {!loading && !error && (
                <ScheduleCalendar
                    events={events}
                    rooms={SCHEDULE_ROOMS}
                    onEventClick={handleEventClick}
                />
            )}
        </div>
    );
}
