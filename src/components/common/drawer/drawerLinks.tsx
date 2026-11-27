import { DrawerClose } from "@/components/dialogs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Permissions } from "@/lib/api/permission";
import { UserDisplayResponse } from "@/lib/api/user";
import { GALLERY_ENABLED, NOSECOUNT_ENABLED, SCHEDULE_ENABLED } from "@/lib/constants";
import { BedDouble, Calendar, IdCardLanyard, ImageIcon, Shield, Ticket, UserGroup } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { JSX } from "react/jsx-runtime";
import { UrlObject } from "url";
import DrawerLanguageSelector from "./drawerLanguageSelector";

type DrawerLinkProps = {
  icon?: JSX.Element;
  href: string | UrlObject;
  text: string;
};
function DrawerLink(props: Readonly<DrawerLinkProps>) {
  return (
    <DrawerClose
      nativeButton={false}
      render={
        <Link
          className="text-base no-underline"
          style={{ textDecoration: "none" }}
          title={props.text}
          href={props.href}
        />
      }
    >
      <Button variant="ghost">
        {props.icon && <>{props.icon}</>}
        <span className="align-bottom text-base">{props.text}</span>
      </Button>
    </DrawerClose>
  );
}

export default function DrawerLinks(props: Readonly<{ userData?: UserDisplayResponse | null }>) {
  const t = useTranslations("common");
  const canViewAdminPages = props.userData?.permissions?.includes(Permissions.CAN_SEE_ADMIN_PAGES);

  return (
    <>
      <Accordion className="p-2 pr-7.5">
        <AccordionItem value="reservation">
          <AccordionTrigger className="text-lg">{t("header.links.reservation.title")}</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <DrawerLink
              href="/reservation"
              icon={<Ticket />}
              text={t("header.links.reservation.links.my_booking.title")}
            />
            <DrawerLink href="/badge" icon={<IdCardLanyard />} text={t("header.links.reservation.links.badge.title")} />
            <DrawerLink href="/room" icon={<BedDouble />} text={t("header.links.reservation.links.room.title")} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="convention">
          <AccordionTrigger className="text-lg">{t("header.links.convention.title")}</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            {SCHEDULE_ENABLED && (
              <DrawerLink
                href="/schedule"
                icon={<Calendar />}
                text={t("header.links.convention.links.schedule.title")}
              />
            )}
            {GALLERY_ENABLED && (
              <DrawerLink
                href="/gallery/explore"
                icon={<ImageIcon />}
                text={t("header.links.convention.links.gallery.title")}
              />
            )}
            {NOSECOUNT_ENABLED && (
              <DrawerLink
                href="/nosecount"
                icon={<UserGroup />}
                text={t("header.links.convention.links.nosecount.title")}
              />
            )}
          </AccordionContent>
        </AccordionItem>
        {canViewAdminPages && (
          <AccordionItem value="administration">
            <AccordionTrigger className="text-lg">{t("header.links.admin.title")}</AccordionTrigger>
            <AccordionContent>
              <DrawerLink href="/admin" icon={<Shield />} text={t("header.links.admin.title")} />
            </AccordionContent>
          </AccordionItem>
        )}
        <DrawerLanguageSelector />
      </Accordion>
    </>
  );
}
