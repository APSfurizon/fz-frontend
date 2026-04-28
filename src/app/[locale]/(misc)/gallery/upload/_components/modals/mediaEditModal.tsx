import Button from "@/components/input/button";
import DataForm from "@/components/input/dataForm";
import FpSelect from "@/components/input/fpSelect";
import Modal from "@/components/modal";
import { ConventionEvent } from "@/lib/api/counts";
import { GalleryUpdateFormApiAction } from "@/lib/api/gallery/upload/api";
import { copyrightValues } from "@/lib/api/gallery/upload/main";
import { GalleryUpdateBody, GalleryUploadedMedia } from "@/lib/api/gallery/upload/types";
import { SelectItem } from "@/lib/components/fpSelect";
import { inputEntityCodeExtractor } from "@/lib/components/input";
import { translate } from "@/lib/translations";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type MediaEditModalProps = {
    medias: GalleryUploadedMedia[],
    events: SelectItem[],
    open: boolean,
    onClose: () => void,
    onRefresh: () => void,
}
export default function MediaEditModal(props: Readonly<MediaEditModalProps>) {
    const t = useTranslations("");

    const eventEditingLocked = useMemo(() => new Set(props.medias.map(m => m.eventId)).size > 1, []);

    const editRequestData = (data: GalleryUpdateBody) => {
        return {
            ...data,
            uploadIds: [...props.medias].map(m => m.id)
        };
    }

    return <Modal icon="EDIT_SQUARE" open={props.open} onClose={props.onClose} title={t("common.CRUD.edit")}>
        <DataForm className="vertical-list gap-2mm"
            hideSave
            action={new GalleryUpdateFormApiAction}
            editBodyData={editRequestData}>
            <div className="upload-input-data gap-4mm">
                {/* Event selector */}
                <FpSelect required
                    className="spacer"
                    fieldName={
                        !eventEditingLocked
                            ? "newEventId"
                            : undefined
                    }
                    disabled={eventEditingLocked}
                    items={props.events}
                    label={t("misc.gallery.upload.form.event.label")}
                    placeholder={t("misc.gallery.upload.form.event.placeholder")} />
                {/* Copyright selector */}
                <FpSelect required
                    fieldName="copyright"
                    itemExtractor={inputEntityCodeExtractor}
                    items={copyrightValues}
                    label={t("misc.gallery.upload.form.copyright.label")}
                    placeholder={t("misc.gallery.upload.form.copyright.placeholder")} />
                <div className="bottom-toolbar">
                    <Button className="danger"
                        title={t("common.cancel")}
                        icon="CANCEL"
                        type="button"
                        onClick={() => props.onClose()}>
                        {t("common.cancel")}
                    </Button>
                    <div className="spacer"></div>
                    <Button type="submit"
                        title={t("common.CRUD.save")}
                        icon="SAVE">
                        {t("common.CRUD.save")}
                    </Button>
                </div>
            </div>
        </DataForm>
    </Modal>
}