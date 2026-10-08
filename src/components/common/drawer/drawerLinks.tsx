import { DrawerClose } from "@/components/dialogs";
import Icon, { MaterialIcon } from "@/components/icon";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Permissions } from "@/lib/api/permission";
import { UserDisplayResponse } from "@/lib/api/user";
import { GALLERY_ENABLED, NOSECOUNT_ENABLED, SCHEDULE_ENABLED } from "@/lib/constants";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { UrlObject } from "url";

type DrawerLinkProps = {
  icon?: MaterialIcon;
  href: string | UrlObject;
  text: string;
};
function DrawerLink(props: Readonly<DrawerLinkProps>) {
  return (
    <DrawerClose
      nativeButton={false}
      render={<Link className="text-base no-underline" title={props.text} href={props.href} />}
    >
      {props.icon && (
        <>
          <Icon className="align-middle" icon={props.icon} />
          &nbsp;
        </>
      )}
      <span className="align-bottom text-base">{props.text}</span>
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
              icon="LOCAL_ACTIVITY"
              text={t("header.links.reservation.links.my_booking.title")}
            />
            <DrawerLink href="/badge" icon="PERSON_BOOK" text={t("header.links.reservation.links.badge.title")} />
            <DrawerLink href="/room" icon="BED" text={t("header.links.reservation.links.room.title")} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="convention">
          <AccordionTrigger className="text-lg">{t("header.links.convention.title")}</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            {SCHEDULE_ENABLED && (
              <DrawerLink
                href="/schedule"
                icon="CALENDAR_MONTH"
                text={t("header.links.convention.links.schedule.title")}
              />
            )}
            {GALLERY_ENABLED && (
              <DrawerLink
                href="/gallery/explore"
                icon="IMAGE"
                text={t("header.links.convention.links.gallery.title")}
              />
            )}
            {NOSECOUNT_ENABLED && (
              <DrawerLink href="/nosecount" icon="GROUPS" text={t("header.links.convention.links.nosecount.title")} />
            )}
          </AccordionContent>
        </AccordionItem>
        {canViewAdminPages && (
          <AccordionItem value="administration">
            <AccordionTrigger className="text-lg">{t("header.links.admin.title")}</AccordionTrigger>
            <AccordionContent>
              <DrawerLink href="/admin" icon="SECURITY" text={t("header.links.admin.title")} />
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </>
  );
}
