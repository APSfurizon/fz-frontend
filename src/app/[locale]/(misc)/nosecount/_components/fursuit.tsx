import { FursuitDetails } from "@/lib/api/badge/fursuits";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import { getImageUrl } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";

type NosecountFursuitProps = {
    data: FursuitDetails;
}

export default function NosecountFursuit(props: NosecountFursuitProps) {
    const t = useTranslations();

    return <div className={`attendee rounded-m sponsor-${props.data.sponsorship}`}>
        <div className="attendee-content rounded-s">
            <Image unoptimized
                width={80}
                height={80}
                src={getImageUrl(props.data.propic?.mediaUrl) ?? EMPTY_PROFILE_PICTURE_SRC}
                alt={t("common.header.alt_profile_picture")} />
            <div className="attendee-data">
                <p className="medium">{props.data.name}</p>
                <p className="small">{props.data.species}</p>
            </div>
        </div>
    </div>
}