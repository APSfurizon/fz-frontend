import { FormApiAction, FormDTOBuilder } from "@/lib/components/dataForm";
import { ApiAction, ApiErrorResponse, ApiRequest, ApiResponse, RequestType } from "../global";
import { ConventionEvent } from "../counts";

export interface GetEventSettingsResponse extends ApiResponse {
    event: ConventionEvent,
    badgeUploadDeadline: string,
    roomEditDeadline: string,
    reservationEditDeadline: string,
    bookingStart: string,
    earlyBookingStart: string
}

export class GetEventSettingsApiAction extends ApiAction<GetEventSettingsResponse, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.GET;
    urlAction = "admin/event/settings"
}

export interface PostEventSettings extends ApiRequest {
    eventId?: number,
    badgeUploadDeadline?: string,
    roomEditDeadline?: string,
    reservationEditDeadline?: string,
    bookingStart?: string,
    earlyBookingStart?: string
}

function toIsoDate(date?: string) {
    if (!date) return undefined;
    return new Date(date).toISOString();
}

export function toInputDate(str?: string) {
    if (!str) return undefined;
    const date = new Date(str);
    const yyyy = date.getFullYear();
    const dd = String(date.getDate()).padStart(2, '0');
    const MM = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');

    return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
}

export class UpdateEventSettingsDtoBuilder implements FormDTOBuilder<PostEventSettings> {
    mapToDTO = (data: FormData) => {
        const toReturn: PostEventSettings = {
            eventId: Number(data.get('eventId')?.toString ()),
            badgeUploadDeadline: toIsoDate(data.get('badgeUploadDeadline')?.toString ()),
            roomEditDeadline: toIsoDate(data.get('roomEditDeadline')?.toString ()),
            reservationEditDeadline: toIsoDate(data.get('reservationEditDeadline')?.toString ()),
            bookingStart: toIsoDate(data.get('bookingStart')?.toString ()),
            earlyBookingStart: toIsoDate(data.get('earlyBookingStart')?.toString ()),
        }
        return toReturn;
    }

}

export class UpdateEventSettingsApiAction extends FormApiAction<PostEventSettings, boolean, ApiErrorResponse> {
    authenticated = true;
    method = RequestType.POST;
    dtoBuilder = new UpdateEventSettingsDtoBuilder();
    urlAction = "admin/event/settings"
}