"use client";

import ErrorMessage from "@/components/errorMessage";
import useTitle from "@/components/hooks/useTitle";
import LoadingPanel from "@/components/loadingPanel";
import Icon from "@/components/icon";
import type { MaterialIcon } from "@/components/icon";
import { loadScheduleActivityDetail } from "@/lib/api/schedule_detail";
import { ApiErrorResponse } from "@/lib/api/global";
import { ScheduleActivityApiItem } from "@/lib/schedule";
import { API_MOBILE_URL, EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import "@/styles/misc/schedule_detail.css";

const getScheduleActivityImageUrl = (imageId?: string): string => {
    if (!imageId) {
        return EMPTY_PROFILE_PICTURE_SRC;
    }
    return `${API_MOBILE_URL}/server/loadDealerImgById?id=${imageId}`;
};

export default function ScheduleDetailPage() {
    const t = useTranslations("common");
    const locale = useLocale();
    const formatter = useFormatter();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiErrorResponse>();
    const [activity, setActivity] = useState<ScheduleActivityApiItem>();

    const activityId = useMemo(() => {
        const raw = searchParams.get("id") ?? "";
        const parsed = Number.parseInt(raw, 10);
        return Number.isNaN(parsed) ? null : parsed;
    }, [searchParams]);

    const selectedDayKey = useMemo(() => {
        const day = searchParams.get("day")?.trim();
        return day ? day : undefined;
    }, [searchParams]);

    const isItalian = locale === "it-IT";
    const title = useMemo(() => {
        if (!activity) {
            return t("header.schedule");
        }

        if (isItalian) {
            return activity.titleIT?.trim() || activity.title.trim();
        }

        return activity.title.trim() || activity.titleIT?.trim() || t("header.schedule");
    }, [activity, isItalian, t]);

    useTitle(title);

    useEffect(() => {
        if (activityId === null || activityId <= 0) {
            setActivity(undefined);
            setError({
                errorMessage: t("schedule_detail.errors.invalid_activity_id"),
            });
            return;
        }

        setLoading(true);
        setError(undefined);

        loadScheduleActivityDetail(activityId)
            .then((result) => {
                setActivity(result);
            })
            .catch((reason: ApiErrorResponse | Error) => {
                if (reason instanceof Error) {
                    setError({ errorMessage: reason.message });
                    return;
                }

                setError(reason);
            })
            .finally(() => setLoading(false));
    }, [activityId, t]);

    const localizedTitle = useMemo(() => {
        if (!activity) {
            return "";
        }

        if (isItalian) {
            return activity.titleIT?.trim() || activity.title.trim();
        }

        return activity.title.trim() || activity.titleIT?.trim() || "";
    }, [activity, isItalian]);

    const localizedAbout = useMemo(() => {
        if (!activity) {
            return "";
        }

        if (isItalian) {
            return activity.aboutIT?.trim() || activity.about.trim();
        }

        return activity.about.trim() || activity.aboutIT?.trim() || "";
    }, [activity, isItalian]);

    const startDate = useMemo(() => {
        if (!activity) return null;
        return formatter.dateTime(new Date(activity.start), { dateStyle: "short" });
    }, [activity, formatter]);

    const startTime = useMemo(() => {
        if (!activity) return null;
        return formatter.dateTime(new Date(activity.start), { timeStyle: "short" });
    }, [activity, formatter]);

    const endTime = useMemo(() => {
        if (!activity?.end) return null;
        return formatter.dateTime(new Date(activity.end), { timeStyle: "short" });
    }, [activity, formatter]);

    return (
        <div className="page schedule-detail-page">
            {loading && <LoadingPanel />}
            {!loading && error && <ErrorMessage error={error} />}
            {!loading && !error && activity && (
                <div className="schedule-detail-container schedule-detail-dialog rounded-s vertical-list gap-0">
                    {/* Two-column: info left, image right */}
                    <div className="schedule-detail-body">
                        {/* Left: Info */}
                        <div className="schedule-detail-info-panel vertical-list gap-0">
                            {/* Back button */}
                            <div className="schedule-detail-header-top">
                                <button
                                    className="schedule-detail-back-button"
                                    onClick={() =>
                                        router.push(
                                            selectedDayKey
                                                ? `/schedule?day=${encodeURIComponent(selectedDayKey)}`
                                                : "/schedule",
                                        )
                                    }
                                    type="button"
                                    aria-label={t("schedule_detail.back_to_schedule")}
                                >
                                    <Icon icon="ARROW_BACK" />
                                    <span>{t("schedule_detail.back_to_schedule")}</span>
                                </button>
                            </div>

                            {/* Title */}
                            <div className="schedule-detail-title-section">
                                <h1 className="schedule-detail-main-title">
                                    {activity.titleEmote && <span className="schedule-detail-emoji">{activity.titleEmote}</span>}
                                    {localizedTitle}
                                </h1>
                                {(() => {
                                    const sub = isItalian
                                        ? activity.subtitleIT?.trim() || activity.subtitle?.trim()
                                        : activity.subtitle?.trim() || activity.subtitleIT?.trim();
                                    return sub ? <p className="schedule-detail-subtitle">{sub}</p> : null;
                                })()}
                            </div>

                            {/* Info Section Title */}
                            <div className="schedule-detail-section-title horizontal-list gap-2mm flex-vertical-center">
                                <Icon icon="INFO" />
                                <span>{t("schedule_detail.info_title")}</span>
                            </div>

                            {/* Info Fields */}
                            <div className="schedule-detail-info-list vertical-list gap-3mm">
                                <InfoField icon="DATE_RANGE" label={t("schedule_detail.labels.date")} value={startDate ?? ""} />
                                <InfoField
                                    icon="EVENT"
                                    label={t("schedule_detail.labels.time")}
                                    value={`${startTime}${endTime ? ` - ${endTime}` : ""}`}
                                />
                                {activity.durata && <InfoField
                                    icon="TIMELAPSE"
                                    label={t("schedule_detail.labels.duration")}
                                    value={`${activity.durata ? `${activity.durata}` : "?"}`}
                                />}
                                {activity.host && <InfoField icon="PERSON" label={t("schedule_detail.labels.host")} value={activity.host} />}
                                <InfoField icon="LOCATION_ON" label={t("schedule_detail.labels.location")} value={activity.location} />
                                {activity.language && <InfoField icon="LANGUAGE" label={t("schedule_detail.labels.language")} value={activity.language} />}
                            </div>

                            {/* Sponsor Tags */}
                            <div className="schedule-detail-tags-section horizontal-list gap-2mm flex-wrap">
                                {activity.ultra_sponsor && <span className="schedule-detail-tag tag-explorer">{t("schedule_detail.tags.explorer")}</span>}
                                {activity.super_sponsor && <span className="schedule-detail-tag tag-super">{t("schedule_detail.tags.super_sponsor")}</span>}
                                {activity.sponsor && <span className="schedule-detail-tag tag-sponsor">{t("schedule_detail.tags.sponsor")}</span>}
                                {activity.cancellato && (
                                    <span className="schedule-detail-tag tag-canceled">
                                        {t("schedule_detail.tags.cancelled")}
                                    </span>
                                )}
                            </div>

                        </div>

                        {/* Right: Image */}
                        <div className="schedule-detail-image-container">
                            <Image
                                src={getScheduleActivityImageUrl(activity.logo)}
                                alt={localizedTitle}
                                fill
                                sizes="(max-width: 800px) 34vw, 50vw"
                                className="schedule-detail-image"
                                priority
                                unoptimized
                            />
                        </div>

                        {/* Description across full width below image/info */}
                        {localizedAbout && (
                            <div className="schedule-detail-description">
                                <p className="schedule-detail-description-text">{localizedAbout}</p>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}

function InfoField({ icon, label, value }: { icon: MaterialIcon; label: string; value: string }) {
    return (
        <div className="schedule-detail-info-field horizontal-list gap-2mm">
            <div className="schedule-detail-info-icon">
                <Icon icon={icon} />
            </div>
            <div className="schedule-detail-info-content vertical-list">
                <span className="schedule-detail-info-value"><strong>{label}:</strong> {value}</span>
            </div>
        </div>
    );
}