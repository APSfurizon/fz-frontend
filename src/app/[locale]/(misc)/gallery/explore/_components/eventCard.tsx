import { ExploreEvent } from "@/lib/api/gallery/explore/type"
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import { translate } from "@/lib/translations";
import { useLocale, useTranslations } from "next-intl"
import "@/styles/misc/gallery/explore/eventCard.scss";

type EventCardProps = {
    event: ExploreEvent,
    onClick(event: ExploreEvent): void
}
export default function EventCard(props: Readonly<EventCardProps>) {
    const locale = useLocale();
    const t = useTranslations();

    return <div className="event-card rounded-m" role="button" onClick={() => props.onClick(props.event)}>
        <img className="event-card__image" src={props.event.cardThumbnailMedia?.mediaUrl ?? EMPTY_PROFILE_PICTURE_SRC} />
        <div className="event-card__overlay">
            <div className="spacer"></div>
            <h3 className="event-card__title title medium">{translate(props.event.event.eventNames, locale)}</h3>
            <p className="event-card__count title">{t("misc.gallery.explore.events.card.photo_count", { count: props.event.photoNumber })}</p>
        </div>
    </div>
}