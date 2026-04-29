import { ScheduleActivityApiItem } from "@/lib/schedule";
import { ApiErrorResponse } from "./global";

export async function loadScheduleActivityDetail(activityId: number): Promise<ScheduleActivityApiItem> {
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
    const activity = activities.find((item) => item.id === activityId);

    if (!activity) {
        throw { errorMessage: "Activity not found." } as ApiErrorResponse;
    }

    return activity;
}
