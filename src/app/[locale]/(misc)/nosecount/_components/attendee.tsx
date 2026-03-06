import Icon from "@/components/icon";
import StatusBox from "@/components/statusBox";
import { ExtraDays, SponsorType, UserData } from "@/lib/api/user";
import { getFlagEmoji } from "@/lib/components/userPicture";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";

type NosecountAttendeeProps = {
    data: UserData;
    extraDays?: ExtraDays;
}

export default function NosecountAttendee(props: NosecountAttendeeProps) {
    const t = useTranslations();

    return <div className={`attendee rounded-m sponsor-${props.data.sponsorship}`}>
        <div className="attendee-content rounded-s">
            <Image unoptimized
                width={80}
                height={80}
                src={getImageUrl(props.data.propic?.mediaUrl) ?? EMPTY_PROFILE_PICTURE_SRC}
                alt={t("common.header.alt_profile_picture")} />
            <div className="attendee-data">
                <p className="medium">{props.data.fursonaName}</p>
                <div className="attendee-extra">
                    {props.extraDays &&
                        props.extraDays !== ExtraDays.NONE &&
                        <StatusBox>
                            {t(`furpanel.booking.items.extra_days_${props.extraDays}`)}
                        </StatusBox>
                    }
                </div>
            </div>
            <div className="attendee-badges">
                {props.data.locale && <span className="flag medium">
                    {getFlagEmoji(props.data.locale?.toLowerCase())}
                </span>}
                {props.data.sponsorship !== SponsorType.NONE &&
                    <Icon icon="WORKSPACE_PREMIUM"
                        title={t(`common.sponsorships.${props.data.sponsorship.toLowerCase()}`)} />}
            </div>
        </div>
    </div>
}