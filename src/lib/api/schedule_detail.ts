import { ScheduleActivityApiItem } from "@/lib/schedule";
import { ApiErrorResponse } from "./global";

let cachedScheduleActivities: ScheduleActivityApiItem[] | null = null;

export type ScheduleActivityDetailResolver = (
    activityId: number,
    context: { cachedActivities: ScheduleActivityApiItem[] | null },
) => Promise<ScheduleActivityApiItem | undefined>;

export function primeScheduleActivitiesCache(activities: ScheduleActivityApiItem[]): void {
    cachedScheduleActivities = [...activities];
}

export function clearScheduleActivitiesCache(): void {
    cachedScheduleActivities = null;
}

export async function loadScheduleActivities(): Promise<ScheduleActivityApiItem[]> {
    const response = await fetch("/api/schedule", {
        cache: "no-store",
    });

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

    const result = await response.json();
    const activities = Array.isArray(result) ? (result as ScheduleActivityApiItem[]) : [];
    primeScheduleActivitiesCache(activities);
    return activities;
}

const defaultScheduleActivityDetailResolver: ScheduleActivityDetailResolver = async (
    activityId,
    context,
) => {
    const fromCache = context.cachedActivities?.find((item) => item.id === activityId);
    if (fromCache) {
        return fromCache;
    }

    const activities = await loadScheduleActivities();
    return activities.find((item) => item.id === activityId);
};

let scheduleActivityDetailResolver: ScheduleActivityDetailResolver =
    defaultScheduleActivityDetailResolver;

export function setScheduleActivityDetailResolver(
    resolver: ScheduleActivityDetailResolver | null,
): void {
    scheduleActivityDetailResolver = resolver ?? defaultScheduleActivityDetailResolver;
}

export async function loadScheduleActivityDetail(activityId: number): Promise<ScheduleActivityApiItem> {
    const activity = await scheduleActivityDetailResolver(activityId, {
        cachedActivities: cachedScheduleActivities,
    });

    if (!activity) {
        throw { errorMessage: "Activity not found." } as ApiErrorResponse;
    }

    return activity;
}
