"use client";
import { FursuitDetails } from "@/lib/api/badge/types";
import { ExtraDays, UserData } from "@/lib/api/user";
import { getFlagEmoji } from "@/lib/components/userPicture";
import { EMPTY_PROFILE_PICTURE_SRC } from "@/lib/constants";
import "@/styles/components/userPicture.css";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo } from "react";
import StatusBox from "./statusBox";

export default function UserPicture({
  size,
  className,
  userData,
  fursuitData,
  extraDays = ExtraDays.NONE,
  showNickname,
  showFlag,
  hideEffect = false,
}: Readonly<{
  size?: number;
  className?: string;
  userData?: UserData;
  fursuitData?: FursuitDetails;
  extraDays?: ExtraDays;
  showNickname?: boolean;
  showFlag?: boolean;
  hideEffect?: boolean;
}>) {
  const t = useTranslations();
  const pictureData = userData;
  const fursuitPictureData = fursuitData;

  const borderClassName = useMemo(
    () => `
        image-container rounded-l
        sponsor-${pictureData?.sponsorship ?? fursuitPictureData?.sponsorship ?? "NONE"}
        ${hideEffect ? "no-effect" : ""}
      `,
    [pictureData, fursuitData]
  );

  const isFursuit = !userData && fursuitData;

  return (
    <div className={["user-picture-container", "vertical-list", "align-items-center", className ?? ""].join(" ")}>
      <div className={borderClassName}>
        <Image
          unoptimized
          className="rounded-m profile-picture"
          src={pictureData?.propic?.mediaUrl ?? fursuitPictureData?.propic?.mediaUrl ?? EMPTY_PROFILE_PICTURE_SRC}
          alt={t("common.header.alt_profile_picture")}
          quality={100}
          width={size ?? 32}
          height={size ?? 32}
        ></Image>
        <span style={{ display: "none" }}>{pictureData?.propic?.mediaUrl}</span>
        {pictureData?.locale && showFlag && (
          <span className="flag medium">{getFlagEmoji(pictureData?.locale.toLowerCase())}</span>
        )}
      </div>
      {showNickname && (
        <span className="title semibold nickname small" style={{ maxWidth: size }}>
          {pictureData?.fursonaName ?? fursuitPictureData?.name ?? ""}
        </span>
      )}
      {!isFursuit && extraDays != ExtraDays.NONE && (
        <StatusBox>{t(`furpanel.booking.items.extra_days_${extraDays}`)}</StatusBox>
      )}
    </div>
  );
}
