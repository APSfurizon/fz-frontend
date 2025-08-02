"use client"
import { useModalUpdate } from "@/components/context/modalProvider";
import Icon, { ICONS } from "@/components/icon";
import ComboBox from "@/components/input/combobox";
import DataForm from "@/components/input/dataForm";
import FpInput from "@/components/input/fpInput";
import ModalError from "@/components/modalError";
import { GetEventSettingsApiAction, GetEventSettingsResponse,
    toInputDate, UpdateEventSettingsApiAction } from "@/lib/api/admin/eventSettings";
import { ConventionEvent, GetAllEventsApiAction } from "@/lib/api/counts";
import { ApiDetailedErrorResponse, ApiErrorResponse, runRequest } from "@/lib/api/global";
import { ComboboxItem } from "@/lib/components/combobox";
import { inputEntityIdExtractor } from "@/lib/components/input";
import { TranslatableInputEntity } from "@/lib/translations";
import { firstOrUndefined, getParentDirectory } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function EventPage ({ params }: { params: Promise<{ slug: string[] }> }) {

    const path = usePathname();
    const t = useTranslations();
    const locale = useLocale();
    const [eventSettings, setEventSettings] = useState<GetEventSettingsResponse>();
    const [loading, setLoading] = useState(false);
    const {showModal} = useModalUpdate();
    const [allEvents, setAllEvents] = useState<ConventionEvent[]>();
    const [selectedEvent, setSelectedEvent] = useState<ConventionEvent>();

    useEffect(() => {
        if (!allEvents) {
            setLoading(true);
            runRequest(new GetAllEventsApiAction())
                .then(events => setAllEvents(events.events))
                .catch(err => showModal(
                        t("common.error"),
                        <ModalError error={err} translationRoot="furpanel" translationKey="admin.pretix.data.errors" />
                    ))
                .finally(() => setLoading(false));
        }
    }, [allEvents]);

    useEffect(() => {
        if (!allEvents) return;
        params.then(data => {
            const [eventId] = data.slug ?? [""];
            const found = allEvents.find(itm => itm.id === Number(eventId))
            setSelectedEvent(found ?? firstOrUndefined(allEvents));
        });
    }, [allEvents])

    useEffect(()=>{
        if (!selectedEvent) return;
        setLoading(true);
        window.history.pushState(null, "", ["", locale, "admin", "event", selectedEvent.id].join("/"))
        runRequest(new GetEventSettingsApiAction(), [encodeURIComponent(selectedEvent.id)])
        .then(evtSet => setEventSettings(evtSet))
        .catch(err => showModal(
                t("common.error"),
                <ModalError error={err} translationRoot="furpanel" translationKey="admin.pretix.data.errors" />
            ))
        .finally(() => setLoading(false));
    }, [selectedEvent])

    const selectableEvents = useMemo(() => {
        return allEvents?.map(evt => 
            new ComboboxItem(evt.id, evt.slug, evt.slug, undefined, undefined, undefined, evt.eventNames))
            ?? []
    }, [allEvents])

    const onEventSelectionChange = (item?: TranslatableInputEntity) => {
        if (!item || !allEvents || allEvents.length == 0) return;
        const event = allEvents.find(evt => evt.id === item.id);
        setSelectedEvent(event);
    }

    const onFail = (data: ApiErrorResponse | ApiDetailedErrorResponse) => {
        showModal(
            t("common.error"),
            <ModalError error={data} translationRoot="furpanel" translationKey="admin.pretix.data.errors" />)
    }

    return <>
    <div className="page">
        <div className="horizontal-list flex-vertical-center gap-4mm flex-wrap">
            <a href={getParentDirectory(path)}><Icon iconName={ICONS.ARROW_BACK} /></a>
            <span className="title medium">{t("furpanel.admin.events.config.event_settings.title")}</span>
            <div className="spacer"/>
            <ComboBox itemExtractor={inputEntityIdExtractor} fieldName=""
                items={selectableEvents} onChange={onEventSelectionChange}
                required/>
        </div>
        <DataForm loading={loading} disabled={!eventSettings} action={new UpdateEventSettingsApiAction}
            resetOnFail={false} onFail={onFail}>
            <input name="eventId" type="hidden" value={selectedEvent?.id ?? ""}/>
            <div className="form-pair">
                <FpInput fieldName="bookingStart" inputType="datetime-local"
                    label={t("furpanel.admin.events.config.event_settings.input.booking_start")}
                    initialValue={toInputDate(eventSettings?.bookingStart)}
                    required/>
                <FpInput fieldName="earlyBookingStart" inputType="datetime-local"
                    label={t("furpanel.admin.events.config.event_settings.input.early_booking_start")}
                    initialValue={toInputDate(eventSettings?.earlyBookingStart)}
                    required/>
            </div>
            <div className="form-pair">
                <FpInput fieldName="badgeUploadDeadline" inputType="datetime-local"
                    label={t("furpanel.admin.events.config.event_settings.input.reservation_edit_deadline")}
                    initialValue={toInputDate(eventSettings?.reservationEditDeadline)}
                    required/>
                <FpInput fieldName="roomEditDeadline" inputType="datetime-local"
                    label={t("furpanel.admin.events.config.event_settings.input.badge_upload_deadline")}
                    initialValue={toInputDate(eventSettings?.badgeUploadDeadline)}
                    required/>
            </div>
            <div className="form-pair">
                <FpInput fieldName="reservationEditDeadline" inputType="datetime-local"
                    label={t("furpanel.admin.events.config.event_settings.input.room_edit_deadline")}
                    initialValue={toInputDate(eventSettings?.roomEditDeadline)}
                    required/>
            </div>
        </DataForm>
    </div>
    </>
}